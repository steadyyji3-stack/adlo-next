# 金流架構決策鎖定｜Lorenzo｜2026-04-20

> **此為金流選型的單一真相源。Kael / Ada / 未來 agent 以此為準。**
> 搭配 `00-DECISION-LOCKED.md`（定價）、`P1-revamp-items.md`（MLP）共同成套。

---

## ✅ Lorenzo 決策鎖定

| # | 議題 | 決定 | 含意 |
|---|------|------|------|
| **1** | 金流選型 | **C（雙軌）** | ECPay 主線 / Stripe 保留給未來跨境 |
| **2** | 開發節奏 | **A** | 沙盒先開發，不等正式商店統編 |
| **3** | 訂閱收款方式 | **A** | 綠界信用卡定期定額（2.75%，自動扣款） |

---

## 🎯 雙軌架構設計

### 抽象層設計原則

```
業務邏輯層（/api/orders, /api/subscriptions）
        ↓
PaymentProvider 介面（統一契約）
        ↓
    ├── ECPayProvider（主線 / 台灣客戶）
    └── StripeProvider（預留 / 未來跨境）
```

**核心原則：**
- 所有金流呼叫走 `PaymentProvider` 介面，不直接依賴 ECPay 或 Stripe SDK
- Postgres `payments` 表加 `provider` 欄位（`ecpay` / `stripe`）
- Webhook 路由分離：`/api/ecpay/callback` 與 `/api/stripe/webhook`
- 未來要開跨境站，只需實作 StripeProvider，業務邏輯不動

### 各 Layer 對應金流

| 層級 | 產品 | 主金流 | 備援 |
|------|------|--------|------|
| L0 | /check 免費 | 無 | — |
| L1 | 診斷包 1,990 | **ECPay 信用卡一次性** | — |
| L2 | 訂閱月繳 8,800+ | **ECPay 信用卡定期定額** | — |
| L2 | 訂閱年繳 85 折 | **ECPay 信用卡一次性** | — |
| L3 | 推薦拆帳 | 後台抵扣，不動金流 | — |
| 未來 | 跨境訂閱 | **Stripe**（預留介面） | — |

---

## 📅 明天開工清單（2026-04-21）

### 早上（沙盒註冊 + 環境建置）
- [ ] 註冊綠界**特店測試環境**（MerchantID: 3002607 是全站共用 sandbox）
- [ ] `pnpm add ecpay_aio_nodejs`（官方 SDK）
- [ ] `.env.local` 新增 ECPay 測試 key：
  - `ECPAY_MERCHANT_ID`
  - `ECPAY_HASH_KEY`
  - `ECPAY_HASH_IV`
  - `ECPAY_ENV=sandbox`
- [ ] 抽象層 `src/lib/payments/PaymentProvider.ts`（介面定義）
- [ ] `src/lib/payments/ECPayProvider.ts`（實作）
- [ ] `src/lib/payments/StripeProvider.ts`（stub，回傳 `NotImplemented`）

### 下午（API 端點 + Webhook）
- [ ] `POST /api/payments/checkout` — 統一入口，依 provider dispatch
- [ ] `POST /api/ecpay/callback` — 綠界付款結果通知（CheckMacValue 驗證）
- [ ] `GET /api/ecpay/return` — 付款完成導回 `/diagnostic/thank-you`
- [ ] `POST /api/ecpay/period-callback` — 定期定額每期通知
- [ ] Postgres migration：
  - `payments` 表加 `provider`, `external_id`, `period_no` 欄位
  - `subscriptions` 表加 `ecpay_merchant_trade_no`, `next_billing_at`

### 傍晚（E2E 測試）
- [ ] 沙盒信用卡號 `4311-9522-2222-2222` 跑完整流程
- [ ] 診斷包下單 → 付款 → callback → MailerLite trigger → 交付信寄出
- [ ] 訂閱首期扣款 → callback → Postgres 更新 → 週期排程啟動
- [ ] 失敗情境：付款取消、CheckMacValue 錯誤、重複 callback

### 交付
- [ ] `docs/kael-r01-architecture/04-ecpay-integration.md`（新增）
- [ ] `docs/kael-r01-architecture/04-stripe-integration.md` → rename `04-stripe-archived.md`（保留）
- [ ] `03-api-design.md` 更新金流端點段落
- [ ] 測試影片 / 截圖

---

## 🚧 Guardrails（不可跨越）

### 資安
- ECPay Hash Key / IV **絕不** commit 進 git，一律走 `.env.local` / Vercel env
- `CheckMacValue` 驗證失敗的 callback → 直接 403 + 記 log，**不能** fallback 信任
- 付款金額由**後端**從 Postgres 讀取，前端傳來的金額只做顯示，不作為扣款依據
- 訂閱取消必須呼叫 ECPay API 中止定期定額，不能只改 DB 狀態

### 業務
- 診斷包 R-01 的 30 天升級折抵邏輯**不受金流切換影響**，靠 `diagnostic_orders.paid_at` 計算
- 退款處理依 `00-DECISION-LOCKED.md`：使用升級折抵後禁止退款
- 定期定額綁定失敗時，自動發送 email 請客戶更新卡片（不直接停權，給 7 天緩衝）

### 成本
- 沙盒可無限測試，**不**用真卡、**不**用真錢
- 正式商店上線前，Stripe 帳號先**不**啟用（避免兩邊都在跑增加維運成本）
- MailerLite trigger 一律走 ECPay callback（Stripe 停寫）

---

## 🔴 Blockers

| 項目 | 狀態 | 解除條件 |
|------|------|---------|
| ECPay 沙盒 | ✅ 無 blocker，明天開工 | — |
| ECPay 正式商店 | ⏳ 等統編 | Lorenzo 手上 |
| 銀行撥款帳戶 | ⏳ 等 | Lorenzo 開戶後提供 |
| Stripe 預留介面 | ✅ 寫 stub 即可 | 未來跨境啟用 |

**Kael 行動：** 沙盒先跑完整 E2E。正式商店核下來後，只需換 4 個 env var + domain 白名單設定，一天內上線。

---

## 📐 後續變更規則

金流 provider / 拆帳比例 / 費率變更需 Lorenzo 書面同意，改此檔並附變更紀錄。

---

## 📂 相關文件

- `00-DECISION-LOCKED.md` — 定價與 R-01 規格
- `P1-revamp-items.md` — MLP 病毒擴散
- `kael-r01-architecture/04-ecpay-integration.md` — 明天 Kael 產出
- `kael-r01-architecture/04-stripe-archived.md` — Stripe 架構封存
