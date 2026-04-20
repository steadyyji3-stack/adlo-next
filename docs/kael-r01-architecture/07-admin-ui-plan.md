# 07 — Admin 後台規劃

**作者**：Kael
**日期**：2026-04-20
**現況盤點**：
- 既有 admin 入口 `src/app/admin/page.tsx`（只管 /contact 的諮詢表）
- 既有 middleware `src/middleware.ts`：`/admin/:path*` cookie = `ADMIN_SECRET`
- 登入 API `src/app/api/admin/login/route.ts`（固定密碼）
- **無 user table、無角色管理、無 RBAC**

---

## 1. 現有 admin 基礎建設盤點（實際讀檔結論）

| 項目 | 現況 | R-01 需求差距 |
|---|---|---|
| 登入 | 單一密碼 cookie，httpOnly | Phase 1 可沿用；Phase 2 應升級 |
| Role | 無 | R-01 Phase 1 不切分也 OK（只有 Lorenzo 一人）|
| UI 框架 | shadcn/ui Table/Card/Dialog 齊備（見 `src/components/ui/*`）| ✅ 直接複用 |
| 既有列表範式 | `src/app/admin/page.tsx`：useEffect fetch、30 秒輪詢、filter、dialog 詳情 | ✅ 作為模板 clone |
| 現有 API 模式 | `/api/submissions`、`/api/submissions/[id]/status` | ✅ 模仿 |

**結論**：**基礎建設夠用**，不需要前置工程改造，直接在現有結構擴充即可。

---

## 2. 新增頁面結構

```
src/app/admin/
├── page.tsx                         ← 既有：contact submissions
├── login/page.tsx                   ← 既有
└── diagnostic/
    ├── layout.tsx                   ← 新增：子導航（訂單 / 退款 / 統計）
    ├── orders/
    │   ├── page.tsx                 ← 新增：列表
    │   └── [id]/page.tsx            ← 新增：詳情（含 intake、報告上傳、交付按鈕）
    ├── refunds/
    │   └── page.tsx                 ← 新增：待審退款列表
    └── stats/
        └── page.tsx                 ← 新增：簡易統計（Phase 2）
```

---

## 3. `/admin/diagnostic/orders` 頁面結構

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  子導航：[訂單列表] [退款申請(3)] [統計]                     │
├──────────────────────────────────────────────────────────────┤
│ 統計卡：│ 本月訂單 │ 今日新單 │ 待交付 │ 逾期! │ 待退款 │    │
│         │  42     │   3     │   7   │  1   │  2   │         │
├──────────────────────────────────────────────────────────────┤
│ 篩選：[狀態 ▼] [SLA 狀態 ▼] 搜尋：[______] [刷新]            │
├──────────────────────────────────────────────────────────────┤
│ 表格：                                                        │
│ ┌─────────────┬─────────┬──────────┬────────┬────────┬──────┐│
│ │ 訂單編號    │ 客戶    │ 狀態     │ 付款   │ SLA    │ 操作 ││
│ ├─────────────┼─────────┼──────────┼────────┼────────┼──────┤│
│ │ DX-...-0023 │ 王小明  │ 待交付   │ 4/18   │ 🔴 逾期│ [詳情]││
│ │ DX-...-0024 │ 李小姐  │ Intake完 │ 4/19   │ 正常   │ [詳情]││
│ └─────────────┴─────────┴──────────┴────────┴────────┴──────┘│
│ Pagination：< 1 2 3 4 5 >                                    │
└──────────────────────────────────────────────────────────────┘
```

### 欄位

| 欄位 | 說明 |
|---|---|
| 訂單編號 | `order_no`，可複製 |
| 客戶 | 姓名（點擊複製 email） |
| 狀態 | Badge（7 種顏色：paid / intake_done / report_sent / upgraded / refunded / failed / expired） |
| 付款時間 | `paid_at` 格式化 |
| SLA | 若 `expected_ready_by < now()` 且 `report_status != 'ready'` → 🔴 逾期；還有 24h 內到期 → 🟡 即將到期 |
| UTM source | 小字顯示 |
| 操作 | `[詳情]` → 開 Dialog |

### 篩選
- 狀態多選
- SLA 狀態：全部 / 正常 / 即將到期 / 逾期
- 日期範圍（預設最近 30 天）
- 搜尋：order_no / email / 姓名

---

## 4. `/admin/diagnostic/orders/[id]` 詳情頁

**四個區塊**：

### 4.1 訂單資訊卡
- order_no、付款時間、金額、Stripe session（連結到 Stripe Dashboard）、狀態 badge、UTM

### 4.2 客戶 Intake 內容
- 展開 `intake_data` JSON，以 Card + Field 呈現
- 若尚未提交 → 顯示「客戶未填寫 intake」+ 寄催促信按鈕

### 4.3 報告區（最重要）
```
┌─────────────────────────────────────────────────┐
│ 報告狀態：Drafting                              │
│ SLA 到期：2026-04-22 14:00（剩 18h）            │
│                                                 │
│ ① 上傳 PDF：[選擇檔案] [上傳]                   │
│ ② 填寫摘要（emil 會用）：                        │
│    [text area____________________]              │
│ ③ 分數（選填）：SEO:__  GBP:__  SEM:__          │
│                                                 │
│  [儲存草稿]    [✅ 標記已完成並寄出 email]       │
└─────────────────────────────────────────────────┘
```

「標記已完成並寄出 email」按鈕 → 呼叫 `A4 deliver`：
1. 寫 `ready_at=now()`
2. 產生 Stripe coupon
3. 觸發 MailerLite E3（report_ready）
4. 狀態更新為 `report_sent`
5. 需二次確認 dialog（避免誤點）

### 4.4 事件時間軸
| 時間 | 事件 | 來源 |
|---|---|---|
| 04/18 14:23 | 訂單建立 | webhook |
| 04/18 14:23 | 付款成功 | webhook |
| 04/18 14:24 | E1 order_paid 已寄 | mailerlite_log |
| 04/19 09:11 | Intake 提交 | API |
| 04/19 09:12 | E2 intake_received 已寄 | mailerlite_log |

從 `diagnostic_orders` + `diagnostic_reports` + `mailerlite_log` JOIN 產出。

---

## 5. `/admin/diagnostic/refunds` 待審列表

```
┌──────────────────────────────────────────────────────────┐
│ 排序：最舊在上（符合先審先處理）                           │
├──────────────────────────────────────────────────────────┤
│ ID  訂單          客戶      理由類別      申請時間  操作  │
│ 123 DX-...-0005  王小明   not_satisfied  4/19     [審核] │
│ 124 DX-...-0010  陳先生   tech_issue     4/20     [審核] │
└──────────────────────────────────────────────────────────┘
```

點「審核」開 Dialog：
- 顯示完整理由文字
- 顯示訂單狀態、是否已用 coupon
- 如果已用 coupon → 警示提示「客戶已升級，退款金額建議半退（NT$ 995）」
- 選擇：[同意全額退] [同意部分退 NT$ __] [拒絕] + 備註
- 送出呼叫 A5 `/api/admin/diagnostic/refunds/[id]/decide`

---

## 6. RBAC 規劃（Phase 2，Phase 1 先 skip）

**Phase 1 現況**（R-01 上線時）：
- 只有 Lorenzo 一人，單一密碼 cookie 足夠
- admin middleware 不改

**Phase 2**（預計 3 個月後，團隊擴編時）：
- 引入 Supabase Auth + `admin_users` 表
- 欄位：`email, role (owner|analyst|support), active`
- 角色權限：
  - `owner`：全部
  - `analyst`：可讀、可上傳報告、可標記交付，**不能**退款
  - `support`：只讀 + 可審退款（但大額需 owner 同意）
- middleware 改用 Supabase JWT 驗證

**Phase 1 妥協設計**：在 `A5 decide` 端點加一層「二次確認 token」（email 寄 OTP）即可臨時達到「退款需二次確認」。

---

## 7. 「若現在沒 admin 基礎建設」前置工程清單

（雖然現況夠用，但若 Lorenzo 決定 Phase 1 就上 RBAC，前置工程如下）

1. 建 `admin_users` 表 + migration（0.5 天）
2. Supabase Auth 設定 + magic link 登入（1 天）
3. 改寫 `src/middleware.ts` → 驗 Supabase JWT（0.5 天）
4. Role check helper `requireRole('owner')` 包在每個 admin route（0.5 天）
5. 既有 `/admin` 頁面遷移（0.5 天）

**Kael 建議**：Phase 1 不做。等 Phase 3 擴編時再補。

---

## 8. UI 元件複用盤點

現有 `src/components/ui/*` 都可直接用：
- `Badge`（狀態）、`Button`、`Card`、`Table`、`Dialog`、`AlertDialog`（退款二次確認）、`Select`（篩選）、`Input`（搜尋）、`Form` + `Label`（詳情頁表單）

**新元件需求**：
- `OrderStatusBadge`：統一 7 種狀態配色
- `SlaIndicator`：🔴 🟡 🟢 計算邏輯
- `Timeline`：事件時間軸（shadcn 沒內建，自己刻或用 framer-motion 已裝的）

---

## 9. API 端點對照（與 03-api-design.md 一致）

| UI 動作 | API |
|---|---|
| 列表載入 | A1 GET `/api/admin/diagnostic/orders` |
| 詳情載入 | A2 GET `/api/admin/diagnostic/orders/[id]` |
| 上傳報告 | A3 POST `/api/admin/diagnostic/reports/[id]/upload` |
| 標記交付 | A4 POST `/api/admin/diagnostic/reports/[id]/deliver` |
| 審核退款 | A5 POST `/api/admin/diagnostic/refunds/[id]/decide` |
| 寄催促信 | 新增 A6 POST `/api/admin/diagnostic/orders/[id]/nudge-intake` |

---

## 10. 開發人天估算

| 區塊 | 人天 |
|---|---|
| `/admin/diagnostic/orders` 列表頁 | 1 |
| `/admin/diagnostic/orders/[id]` 詳情頁（含上傳、交付） | 2 |
| `/admin/diagnostic/refunds` + 審核 dialog | 1 |
| 時間軸元件 + StatusBadge + SlaIndicator | 0.5 |
| middleware matcher 擴充 `/api/admin/:path*` | 0.25 |
| 響應式 + 手機版簡化（Lorenzo 可能手機用）| 0.5 |
| 手動 QA | 0.5 |
| **小計** | **~5.75 天** |

## 11. 前置依賴
- 02 schema apply
- 03 所有 admin API 完成
- Cloudflare R2（或 Supabase Storage）上傳 API 可用

> → UI 表格 / 表單的細節樣式 可交由 **Sonnet**。
> → 現有 admin 頁面盤點、shadcn 元件對照 可交由 **Haiku**。
