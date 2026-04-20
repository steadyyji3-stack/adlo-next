# 04 — Stripe 整合完整流程

**作者**：Kael
**日期**：2026-04-20
**現況**：`stripe ^22.0.0` 已裝，`apiVersion: '2025-03-31.basil'`，`src/lib/stripe.ts` 的 `getStripe()` 惰性初始化可複用。**但 Stripe 帳號尚未申請。**

---

## 1. Dashboard 建置步驟（Lorenzo 執行，Stripe 啟用後）

### 1.1 Product / Price

1. **Products → Add product**
   - Name：`Attraction Offer — 在地品牌診斷報告`
   - Description：`adlo 在地品牌快速診斷報告（PDF）`
2. **Price**
   - Pricing model：**One time**（不是 recurring）
   - Amount：**NT$ 1,990 TWD**
   - Tax behavior：`exclusive`（未稅，台灣目前不開發票時切「不含」）
   - 建立後取得 `price_xxx`，寫入 env `STRIPE_PRICE_DIAGNOSTIC`

### 1.2 升級折抵 Coupon

兩種做法，**建議用「每筆 order 動態產生 promotion code」**（R-07 風險對策）：

- 不要用 Dashboard 建好的共用 coupon，會被分享外洩。
- 用 API 在 `A4 deliver` 時產生：
  ```ts
  const coupon = await stripe.coupons.create({
    amount_off: 199000,  // 單位：分（TWD 最小單位為元，但 Stripe 是 × 100）
    currency: 'twd',
    duration: 'once',
    max_redemptions: 1,
    metadata: { order_id },
  });
  const promo = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: `UP${orderNoLast6}`,  // e.g. UP000001
    max_redemptions: 1,
    expires_at: Math.floor(readyAt.getTime()/1000) + 30*86400,
    customer: undefined,  // 不綁 customer 因為付費訂閱可能用新 email
    metadata: { order_id, order_no },
  });
  ```
- **重要**：TWD 在 Stripe 是 **zero-decimal currency 的例外**。實測 `amount_off` 仍需 ×100（1990 → 199000）。apply 前務必用測試金鑰 drill run 一次確認。

### 1.3 Webhook endpoint

- URL：`https://adlo.tw/api/diagnostic/webhook`（**獨立於訂閱 webhook**）
- Events to send：
  - `checkout.session.completed`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- 取得 `whsec_xxx` 寫入 env `STRIPE_WEBHOOK_SECRET_DIAGNOSTIC`

---

## 2. Checkout Session 呼叫範例

**檔案**：`src/lib/diagnostic/stripe.ts`（新建）

```ts
import { getStripe } from '@/lib/stripe';

export async function createDiagnosticCheckoutSession(opts: {
  orderNo: string;
  orderId: string;
  email: string;
  name: string;
  phone?: string;
  origin: string;
  utm: Record<string, string | undefined>;
}) {
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'zh-TW',  // 實際文件查：Stripe locale 列表中 zh-TW 支援
    line_items: [{
      price: process.env.STRIPE_PRICE_DIAGNOSTIC!,
      quantity: 1,
    }],
    currency: 'twd',
    customer_email: opts.email,
    customer_creation: 'always',  // 建立 Customer 物件，便於後續 refund/coupon
    payment_intent_data: {
      metadata: {
        order_no: opts.orderNo,
        order_id: opts.orderId,
        product: 'diagnostic',
      },
      description: `adlo 在地品牌診斷報告 ${opts.orderNo}`,
    },
    metadata: {
      order_no: opts.orderNo,
      order_id: opts.orderId,
      product: 'diagnostic',
      // UTM 全塞 metadata，長度限制 500 字元 / value
      utm_source:   opts.utm.source   ?? '',
      utm_medium:   opts.utm.medium   ?? '',
      utm_campaign: opts.utm.campaign ?? '',
      utm_term:     opts.utm.term     ?? '',
      utm_content:  opts.utm.content  ?? '',
      gclid:        opts.utm.gclid    ?? '',
      fbclid:       opts.utm.fbclid   ?? '',
    },
    payment_method_types: ['card'],  // 台灣另可追加 'link' / 'apple_pay' / 'google_pay' 若已開
    allow_promotion_codes: false,    // R-01 NT$1,990 不允許再套折扣
    success_url: `${opts.origin}/diagnostic/thank-you?order_no=${opts.orderNo}`,
    cancel_url:  `${opts.origin}/diagnostic?canceled=1`,
  });
}
```

**為什麼 metadata 既放 session 又放 payment_intent**：
- `charge.refunded` webhook payload 只有 payment_intent 的 metadata，拿不到 session。
- 雙寫避免之後 refund 流程抓不到 order_no。

---

## 3. Webhook 簽章驗證（Next.js 16 Route Handler 寫法）

**實際文件確認**：Next.js 16 Route Handler 仍以 `req.text()` 拿 raw body，需 `export const runtime = 'nodejs'`。沿用既有 `src/app/api/webhook/stripe/route.ts` 模式。

**檔案**：`src/app/api/diagnostic/webhook/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { Redis } from '@upstash/redis';
import type Stripe from 'stripe';
// ...DB & MailerLite wrapper

export const runtime = 'nodejs';  // raw body 必要

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET_DIAGNOSTIC!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error('[Diagnostic Webhook] signature fail', err);
    return NextResponse.json({ error: 'bad signature' }, { status: 400 });
  }

  // 去重：event.id 同一個 24h 內只處理一次
  const dedupeOk = await redis.set(`dx:wh:${event.id}`, '1', { nx: true, ex: 86400 });
  if (!dedupeOk) {
    return NextResponse.json({ received: true, dedup: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        console.log('[Diagnostic Webhook] unhandled', event.type);
    }
  } catch (err) {
    // 處理失敗：刪除 dedupe key 讓 Stripe 重送
    await redis.del(`dx:wh:${event.id}`);
    console.error('[Diagnostic Webhook] handler error', err);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

---

## 4. 退款流程

### 4.1 API 呼叫

```ts
export async function refundOrder(opts: {
  paymentIntentId: string;
  amountTwd: number;   // 實際要退的金額（TWD 元）
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent';
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  return stripe.refunds.create({
    payment_intent: opts.paymentIntentId,
    amount: opts.amountTwd * 100,  // × 100 給 Stripe
    reason: opts.reason ?? 'requested_by_customer',
    metadata: opts.metadata,
  });
}
```

### 4.2 退款狀態同步

退款 API 返回 `refund.status = 'succeeded' | 'pending' | 'failed'`。

- `succeeded`：立即寫回 DB（`processed_at`）並觸發 MailerLite `refund_confirmed`。
- `pending`：等 `charge.refunded` webhook。
- `failed`：標記 refund request `status=rejected` + 觸發人工處理通知。

### 4.3 已用升級折抵的退款（R-07 風險對策）

```ts
// A5 decide 流程：
if (order.status === 'upgraded' && order.upgrade_coupon_code) {
  // 已用 coupon → 退款金額僅 NT$ 995（50%），或拒退（以條款為準）
  // 同時作廢 promo code（其實已被消耗）
  // 若要追扣升級後的訂閱：另外處理 stripe.subscriptions.cancel() 用 prorate
}
```

---

## 5. 升級折抵的實際「兌現」流程

客戶在報告內按「立即升級 NT$ 1,990 折抵」→ 跳到 `/pricing?coupon=UP000001`（或 query 夾 promotion_code_id）。

在既有 `src/app/api/checkout/route.ts`（訂閱的 checkout）**追加支援**：

```ts
// 現有 checkout route 追加參數 promotionCode?: string
if (promotionCode) {
  sessionParams.discounts = [{ promotion_code: promotionCode }];
  // 不能同時 allow_promotion_codes，兩者 mutually exclusive
  sessionParams.allow_promotion_codes = false;
}
```

並在付款完成 webhook 檢查：
```ts
if (session.total_details?.amount_discount > 0 && metadata.product === 'diagnostic_upgrade') {
  // 對應的 diagnostic_orders 設 status='upgraded', upgraded_subscription=subscription.id
}
```

---

## 6. 失敗重試 / 對帳腳本

### 6.1 Webhook 失敗重試
- Stripe 預設 3 天內重試最多 ~16 次（指數退避）。
- 我們的去重 key TTL 24h，只要 handler 成功就 OK。
- 若 24h 內一直失敗：Stripe Dashboard → Developers → Webhooks → 手動重送。

### 6.2 每日對帳 cron
新建 `src/app/api/cron/diagnostic-reconcile/route.ts`（Vercel Cron 觸發）：

1. 列 DB 中「過去 24h `status=pending` 的 order」→ 用 `stripe.checkout.sessions.retrieve` 查狀態 → 若 `paid` 但我們漏掉 webhook，補寫 DB。
2. 列 `status=paid` 但 `diagnostic_reports` 沒記錄的 order → 補建骨架。
3. 列 `refund_requests.status=approved` 但 `processed_at IS NULL` 且 > 6h → 發 Slack / Resend 警示。

Vercel Cron 設定（`vercel.json`）：
```json
{ "crons": [{ "path": "/api/cron/diagnostic-reconcile", "schedule": "0 2 * * *" }] }
```

---

## 7. 測試金鑰 drill run checklist

Stripe 尚未上線時可先做：

1. `sk_test_` 放 dev env，跑完整 checkout → webhook → coupon → refund 流程
2. 驗證台灣 TWD 金額 × 100 無誤（Stripe Dashboard 顯示 NT$ 1,990）
3. 驗證 webhook 去重：同一 event 送兩次，第二次必須回 `dedup: true`
4. 驗證簽章：故意改 body，必須回 400
5. 驗證 coupon 期限：人工設 expires_at 為 1 小時前，checkout 要擋下

---

## 8. 環境變數表

| Key | 用途 |
|---|---|
| `STRIPE_SECRET_KEY` | 既有 |
| `STRIPE_PRICE_DIAGNOSTIC` | 新增 — one-time price id |
| `STRIPE_WEBHOOK_SECRET_DIAGNOSTIC` | 新增 — 獨立 webhook 密鑰 |
| `REPORT_SIGNING_SECRET` | 新增 — 32 byte random（email_hash 用） |

---

## 9. 開發人天估算

| 區塊 | 人天 |
|---|---|
| Dashboard 建置（Lorenzo） | 0.25 |
| `src/lib/diagnostic/stripe.ts` 封裝 | 0.5 |
| Webhook handler + 去重 | 1 |
| Refund 流程 + 已升級情境分支 | 0.75 |
| Coupon 動態產生 + 升級 checkout 修改 | 0.75 |
| 對帳 cron | 0.5 |
| 測試（test keys）| 1 |
| **小計** | **~4.75 天** |

## 10. 前置依賴
- Stripe 帳號啟用（Go/No-Go 第一 blocker）
- 02-data-model.sql 已 apply
- UPSTASH_REDIS 已有（既有）

> → Dashboard 建置步驟（§1） **可交由 Sonnet / 人工**。對帳 cron 和 test keys drill run 屬於精確寫作，**Sonnet** 合適。
