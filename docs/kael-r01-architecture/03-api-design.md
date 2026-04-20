# 03 — R-01 API 設計

**作者**：Kael
**日期**：2026-04-20
**基於**：Next.js 16.2.1 Route Handler（`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`）
**認證策略參考**：`src/middleware.ts`（既有 admin cookie）

---

## 0. Next.js 16 Route Handler 關鍵差異（節錄實際文件）

實際看 `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`：

1. **動態路由 params 是 Promise**：
   ```ts
   import type { NextRequest } from 'next/server'
   export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
     const { id } = await ctx.params
     return Response.json({ id })
   }
   ```
   `RouteContext<'/path/[id]'>` 是全域型別（typegen 產生）。
   → 我們下面 spec 會用這個形式。

2. **GET 預設不 cache**；要 cache 需 `export const dynamic = 'force-static'`。R-01 所有路由都是動態，照預設。

3. **Webhook 必須讀 raw body**（見既有 `src/app/api/webhook/stripe/route.ts` L6 `export const runtime = 'nodejs'`）。複用此模式。

---

## 1. 路徑總覽（R-01 §7 對照）

| # | Path | Method | 用途 | Auth |
|---|---|---|---|---|
| P1 | `/api/diagnostic/checkout` | POST | 建立 Stripe checkout session | Public |
| P2 | `/api/diagnostic/webhook` | POST | Stripe webhook（**獨立 endpoint**，與訂閱分開） | Stripe 簽章 |
| P3 | `/api/diagnostic/intake` | POST | 客戶填 intake 問卷 | token（email_hash） |
| P4 | `/api/diagnostic/orders/[id]` | GET | 客戶查單（報告 URL） | email_hash query |
| P5 | `/api/diagnostic/refund-request` | POST | 客戶提退款 | email_hash |
| A1 | `/api/admin/diagnostic/orders` | GET | 列表 | admin cookie |
| A2 | `/api/admin/diagnostic/orders/[id]` | GET / PATCH | 詳情 / 更新 | admin cookie |
| A3 | `/api/admin/diagnostic/reports/[id]/upload` | POST | 上傳報告 PDF | admin cookie |
| A4 | `/api/admin/diagnostic/reports/[id]/deliver` | POST | 標記交付 + 觸發 email | admin cookie |
| A5 | `/api/admin/diagnostic/refunds/[id]/decide` | POST | 批准 / 拒絕退款 | admin cookie |

---

## 2. 認證策略

### 2.1 Public（客戶）— email_hash token
- 付款完成後，系統為每筆 order 產生 `customer_email_hash = sha256(email + REPORT_SIGNING_SECRET)`。
- 客戶端回傳的所有 URL 都帶 `?token=<email_hash>`。
- 後端比對 `token === row.customer_email_hash` → 授權通過。
- **不用 JWT**（太重），不用 session cookie（客戶不登入）。

### 2.2 Admin — 沿用既有 middleware
- `src/middleware.ts` 已用 `admin_token` cookie = `ADMIN_SECRET` 比對。
- R-01 admin route 放在 `/admin/diagnostic/*`，自動被現有 matcher `/admin/:path*` 保護。
- `/api/admin/*` **目前不在 matcher 中**！需擴充 matcher 為 `['/admin/:path*', '/api/admin/:path*']`，或在每支 admin API handler 內再驗一次 cookie（推薦，更明確）。

### 2.3 Webhook — Stripe 簽章
- 與既有 `src/app/api/webhook/stripe/route.ts` 相同模式。
- **建議新開獨立 endpoint** `/api/diagnostic/webhook`，用獨立的 `STRIPE_WEBHOOK_SECRET_DIAGNOSTIC`，避免訂閱 webhook 的事件混入。

---

## 3. 端點規格

### P1. POST `/api/diagnostic/checkout`

**檔案**：`src/app/api/diagnostic/checkout/route.ts`

**入參 zod schema**：
```ts
const CheckoutSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(1).max(50),
  phone:    z.string().regex(/^09\d{8}$/).optional(),
  utm:      z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
    gclid: z.string().optional(),
    fbclid: z.string().optional(),
    referrer: z.string().optional(),
    landing_path: z.string().optional(),
  }).default({}),
  agree_tos: z.literal(true),  // 必須勾選條款
});
```

**回傳**：
```json
{ "url": "https://checkout.stripe.com/c/pay/cs_xxx", "order_no": "DX-20260421-000001" }
```

**流程**：
1. zod validate（失敗 400）
2. Upstash Redis rate limit：`ip + email` key，10 分鐘內最多 3 次（失敗 429）
3. `INSERT INTO diagnostic_orders (status='pending', order_no, email, email_hash, source_utm) RETURNING id, order_no`
4. 呼叫 `stripe.checkout.sessions.create`（詳見 `04-stripe-integration.md`）
5. 更新 `stripe_session_id` 到 order
6. 回傳 `url`

**錯誤碼**：400 validation / 429 rate limit / 500 Stripe / 500 DB

**Rate Limit**：Upstash `@upstash/redis` 已裝，用 sliding window：同一 IP 每分鐘 10 次、同一 email 每 10 分鐘 3 次。

---

### P2. POST `/api/diagnostic/webhook`

**檔案**：`src/app/api/diagnostic/webhook/route.ts`

```ts
export const runtime = 'nodejs';  // 必要，讀 raw body
```

**處理事件**：
- `checkout.session.completed`（mode=payment）→ 更新 order 為 `paid`、建立 `diagnostic_reports` 骨架（status=queued, expected_ready_by=now+72h）、觸發 MailerLite `order_paid`
- `payment_intent.payment_failed` → order 標 `failed`、觸發 MailerLite `payment_failed`（spec 未列，建議加）
- `charge.refunded` → 對應 refund request 更新 `status=processed`、order 標 `refunded`

**去重機制**：
```ts
const dedupeKey = `diagnostic:webhook:${event.id}`;
const ok = await redis.set(dedupeKey, '1', { nx: true, ex: 86400 });
if (!ok) return NextResponse.json({ received: true, dedup: true });
```

**錯誤碼**：400 signature / 200 其他（Stripe 要 200 才不重送）

---

### P3. POST `/api/diagnostic/intake`

**檔案**：`src/app/api/diagnostic/intake/route.ts`

**入參**：
```ts
const IntakeSchema = z.object({
  order_no: z.string().regex(/^DX-\d{8}-\d{6}$/),
  token:    z.string().length(64),  // email_hash hex
  data: z.object({
    business_name: z.string().min(1),
    gbp_url:       z.string().url().optional(),
    website:       z.string().url().optional(),
    main_services: z.array(z.string()).min(1).max(10),
    target_area:   z.string(),
    competitors:   z.array(z.string().url()).max(5).default([]),
    current_ads_monthly: z.number().int().min(0).optional(),
    pain_points:   z.array(z.string()).min(1),
  }),
});
```

**流程**：
1. 依 `order_no` 取 order，驗 `token === customer_email_hash`（失敗 403）
2. 若 `status !== 'paid'` → 409 Conflict
3. UPDATE `diagnostic_reports` SET `intake_data=$1, intake_submitted_at=now(), report_status='queued'`
4. UPDATE `diagnostic_orders` SET `status='intake_done'`
5. 觸發 MailerLite `intake_received`
6. 回傳 `{ ok: true }`

**錯誤碼**：400 / 403 / 404 / 409 / 500

---

### P4. GET `/api/diagnostic/orders/[id]?token=xxx`

**檔案**：`src/app/api/diagnostic/orders/[id]/route.ts`

```ts
export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/diagnostic/orders/[id]'>
) {
  const { id } = await ctx.params;
  // ...
}
```

**用途**：客戶自己查狀態 / 拿報告 URL（`/diagnostic/report/[id]` 頁面 fetch）

**回傳**：
```ts
{
  order_no: string;
  status: 'paid' | 'intake_done' | 'report_sent' | 'upgraded' | 'refunded';
  report_ready: boolean;
  report_url: string | null;       // 已 ready 才回傳
  upgrade_coupon_code: string | null;
  upgrade_expires: string | null;  // ISO
  refundable_until: string | null; // ready_at + 7 天，過了就不能退
}
```

**錯誤碼**：403 / 404

**Rate Limit**：IP 每分鐘 30 次。

---

### P5. POST `/api/diagnostic/refund-request`

**入參**：
```ts
const RefundSchema = z.object({
  order_no: z.string(),
  token:    z.string().length(64),
  reason:   z.string().min(10).max(500),
  category: z.enum(['not_satisfied', 'wrong_target', 'tech_issue', 'other']),
});
```

**流程**：
1. Token 驗證
2. 檢查是否在 `ready_at + 7 天` 內（若已交付）
3. 檢查是否已用 upgrade coupon（若已核銷 → 走 50% 規則或拒絕，見 01 Q3）
4. 已存在 `requested` 狀態 → 409
5. INSERT `diagnostic_refund_requests`
6. Resend 通知內部 admin
7. 回傳 `{ ok: true, request_id }`

---

### A1. GET `/api/admin/diagnostic/orders`

Query params: `?status=paid&q=keyword&page=1&limit=20&sla=overdue`

**回傳**：paginated list + 統計 counters（`new / paid / intake_done / overdue / refund_pending`）

---

### A3. POST `/api/admin/diagnostic/reports/[id]/upload`

**用途**：admin 上傳 PDF 報告（multipart/form-data）

**流程**：
1. 驗 admin cookie
2. 上傳到 R2 / Supabase Storage（key = `diagnostic/{order_no}/report.pdf`）
3. 寫回 `report_pdf_key`、`report_url`（簽章 URL, TTL 30 天）
4. `report_status` → `drafting`（手動按下一支 A4 才 `ready`）

---

### A4. POST `/api/admin/diagnostic/reports/[id]/deliver`

**用途**：標記報告 ready + 觸發 MailerLite `report_ready`

1. UPDATE `report_status='ready', ready_at=now()`
2. UPDATE order `status='report_sent'`
3. 產生 Stripe coupon（`stripe.promotionCodes.create`，見 04）
4. UPDATE `upgrade_coupon_code`, `upgrade_coupon_expires = ready_at + 30 天`
5. 觸發 MailerLite `report_ready`（帶報告 URL + coupon）

---

### A5. POST `/api/admin/diagnostic/refunds/[id]/decide`

```ts
{
  decision: 'approved' | 'rejected',
  notes:    string,
  refund_amount_twd?: number  // 若已用 coupon，可半退
}
```

- 若 approved → `stripe.refunds.create({ payment_intent, amount })`、update order `refunded`、觸發 MailerLite `refund_confirmed`
- 若 rejected → 僅更新狀態，觸發通知信

---

## 4. 共用 utilities（建議位置）

| 檔案 | 用途 |
|---|---|
| `src/lib/diagnostic/db.ts` | Supabase client（service_role）+ query helpers |
| `src/lib/diagnostic/auth.ts` | `verifyEmailHash(email, token)` + admin cookie check |
| `src/lib/diagnostic/schemas.ts` | 全部 zod schemas |
| `src/lib/diagnostic/stripe.ts` | R-01 專用 Stripe helpers（checkout + refund + coupon） |
| `src/lib/diagnostic/mailerlite.ts` | 觸發 7 個 automation 的 wrapper |
| `src/lib/diagnostic/storage.ts` | R2 / Supabase Storage 上傳 + 簽章 URL |
| `src/lib/diagnostic/rate-limit.ts` | Upstash sliding window 共用 helper |

---

## 5. 錯誤碼表

| Code | 意義 |
|---|---|
| 400 | Validation failed |
| 401 | Missing admin cookie |
| 403 | Token 驗證失敗 |
| 404 | Order not found |
| 409 | 狀態衝突（e.g. 已 intake 又送）|
| 410 | 退款視窗已關閉 |
| 429 | Rate limit |
| 500 | Stripe / DB / 上游服務錯誤 |

---

## 6. 開發人天估算

| 區塊 | 人天 |
|---|---|
| zod schemas + shared utils (`src/lib/diagnostic/*`) | 1 |
| P1 checkout | 0.5 |
| P2 webhook（含去重、3 個事件） | 1 |
| P3 intake | 0.5 |
| P4 orders GET | 0.25 |
| P5 refund-request | 0.5 |
| A1–A5 admin routes | 1.5 |
| 錯誤處理 / Sentry log | 0.5 |
| 單元 + 整合測試 | 1.25 |
| **小計** | **~7 天** |

## 7. 前置依賴
- 02-data-model.sql apply 完成
- 04-stripe-integration.md 的 Product / Webhook 已建
- `REPORT_SIGNING_SECRET` env 已設定

> → API 骨架寫完後，**錯誤碼補齊 / zod 細節調整** 可交由 **Sonnet** 執行（邏輯清晰，屬於精確寫作）。
