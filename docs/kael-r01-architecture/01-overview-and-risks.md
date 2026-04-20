# 01 — R-01 Attraction Offer 全局設計一頁紙

**作者**：Kael（首席技術）
**日期**：2026-04-20
**狀態**：架構設計草稿（尚未開發）
**Spec 出處**：`/Users/kim-marketing/Downloads/R-01-attraction-offer.md`

---

## 1. 在整體站點的位置圖

```
adlo.tw
│
├── / (首頁)                                    ← 既有
├── /services/* (服務落地頁)                     ← 既有
├── /pricing (月繳 / 年繳訂閱)                   ← 既有（Stripe subscription）
├── /contact (免費諮詢表單)                      ← 既有（Redis 存單）
│
├── /diagnostic                   [R-01 新增]   ← 「低價誘餌」入口落地頁（NT$1,990）
│   ├── /diagnostic/checkout      [R-01 新增]   ← 重導到 Stripe Checkout
│   ├── /diagnostic/thank-you     [R-01 新增]   ← 付款後導向、首次露出問卷 CTA
│   ├── /diagnostic/intake        [R-01 新增]   ← 問卷填寫頁（token 驗證）
│   ├── /diagnostic/report/[id]   [R-01 新增]   ← 報告查看頁（email hash 驗證）
│   └── /diagnostic/refund        [R-01 新增]   ← 退款申請頁
│
└── /admin                                      ← 既有（Cookie 密碼驗證）
    └── /admin/diagnostic/orders  [R-01 新增]   ← 訂單 / 報告 / 退款管理
```

**R-01 在漏斗中的位置**：
`Ads / Social → /diagnostic → Stripe → Intake → Report (D+3) → 升級 CTA → /pricing`

這是唯一的「低價試水」入口，所有 ¥$1,990 付費流量都走這條。成功後 D+14 才推升級、D+27 提醒 coupon 過期。

---

## 2. 依賴關係圖

```
 ┌──────────────┐      ┌─────────────────┐
 │ /diagnostic  │──┬──▶│ Stripe Checkout │─── metadata:{order_no,utm}
 └──────────────┘  │   └────────┬────────┘
                   │            │
                   │            ▼ webhook:checkout.session.completed
                   │   ┌─────────────────┐
                   │   │ /api/webhook    │──▶ 寫入 diagnostic_orders
                   │   │ /stripe         │──▶ 觸發 MailerLite "order_paid"
                   │   └─────────────────┘
                   │
                   │     ┌────────────────┐
                   └────▶│ MailerLite MCP │ ←── 7 封 email 自動化
                         └────────────────┘
                                  │
                                  ▼ D+3 trigger
                         ┌────────────────┐
                         │ 報告 PDF URL   │ ←── R2 / Supabase Storage
                         └────────────────┘

Shared infra（既有）：
- GTM / GA4：GTM-WN4QZF7D / G-NJ13ZSMK7W
- Resend：內部通知信
- Upstash Redis：/contact 用（R-01 改用「DB（Supabase 或延用 Redis）」討論見下）
- Stripe（尚未申請）：Lorenzo 統編到手才能啟動
```

---

## 3. 關鍵技術盤點（實際讀檔確認）

| 項目 | 現況 | R-01 影響 |
|---|---|---|
| Next.js | **16.2.1**（見 `package.json` 第 30 行）| Route Handler 用 `RouteContext<'/path/[id]'>` 型別，`ctx.params` 是 `Promise`（見 `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` L191-198） |
| React | **19.2.4** | — |
| **資料層** | **Upstash Redis**（`src/lib/submissions.ts`）**不是 Supabase** | **重大決策**：R-01 要三張關聯表 + RLS，Redis KV 做不到。需新增 Supabase Postgres 或 Neon。見 §5 風險 R-05 |
| Stripe SDK | **已裝** `stripe ^22.0.0`、`@stripe/stripe-js ^9.1.0`，`apiVersion: '2025-03-31.basil'` | 可直接複用 `src/lib/stripe.ts` 的 `getStripe()` 惰性初始化模式 |
| Stripe 帳號 | **未申請**（等統編）| Go/No-Go blocker |
| Webhook 範式 | 已有 `src/app/api/webhook/stripe/route.ts`（訂閱用）| R-01 要加 `checkout.session.completed` 的 `mode: payment` 分支 |
| MailerLite | MCP 已接（見 skill `adlo-kael` 工具列表）| 7 封 automation 用 `create_automation` / `build_custom_automation` |
| Admin 認證 | **極簡**：cookie = `ADMIN_SECRET`（`src/middleware.ts`）無 user table、無角色 | 需擴充，但 Phase 1 可沿用（見 07） |
| Resend | 已裝，`hello@adlo.tw` 寄件域已驗證 | 內部通知信直接複用 |
| R2 / 檔案儲存 | **無現成方案** | 報告 PDF 需選 Cloudflare R2 或 Supabase Storage |

> → 查檔類更新（list routes、比對 package 版本）**下次可用 Haiku 執行**。

---

## 4. 五大風險矩陣

| ID | 風險 | 機率 | 影響 | 對策 |
|---|---|---|---|---|
| **R-01** | Stripe 台灣收款帳號未核可，導致上線延期 | 高 | 極高（整個模組卡住） | (1) 統編到手立即送審，(2) 送審期間用測試金鑰完成開發，(3) 若 Stripe 拒絕，備案：綠界 ECPay（有 API 但 TWD-only、退款流程不同） |
| **R-02** | 報告 SLA（承諾 D+3 交付）破表 | 中 | 高（觸發退款、信任崩壞）| (1) 內部 SOP D+2 截止交付，留 24h 緩衝；(2) Admin 列表 D+2 尚未交付自動標紅 + Resend 警示；(3) SLA 違約自動觸發「抱歉信 + 延期通知」 |
| **R-03** | Stripe webhook 重送造成重複寫入 / 重複發信 | 中 | 中 | (1) 每個事件 `event.id` 作為 Redis SETNX 去重 key（TTL 24h）；(2) `diagnostic_orders` unique constraint on `stripe_session_id`；(3) MailerLite 觸發改用 subscriber field flag（已發過就不再發） |
| **R-04** | UTM 遺失（使用者在 Stripe 內徘徊、第三方 cookie 被擋）| 高 | 中（歸因不準）| (1) `/diagnostic` 第一次 hit 就把 UTM 寫進 cookie（90 天 first-touch，見 06）；(2) 同時在 checkout API 把 UTM 放進 Stripe session `metadata`（server-side 唯一可靠路徑）；(3) GA4 用 `transaction_id = order_no` 做對帳 |
| **R-05** | **資料層斷裂**：現有 Redis 無法支撐關聯查詢 + RLS | 高 | 極高（架構選擇）| (1) 引入 Supabase Postgres（推薦，因 MEMORY 指向且有 RLS）；(2) 若想延續 Redis，改用 Upstash Postgres 或 Neon；(3) **不建議**把三張表硬塞 Redis（查詢複雜度爆炸） |

**追加隱性風險（低但需列）**：
- **R-06** 退款爭議：若客戶主張「報告內容不符合期待」但已超 7 天，需人工判斷。建議退款申請送出一律 24h 內人工審核，不自動批。
- **R-07** 升級折抵被濫用：NT$1,990 折扣必須綁單一 customer_email，且只能用一次（Stripe coupon `max_redemptions_per_customer=1`）。
- **R-08** 報告 URL 外洩：`/diagnostic/report/[id]` 若只用 `id` 易被猜測。必須 `id + email_hash` 雙重驗證，且 URL 加時效 token。

---

## 5. Go / No-Go 前置條件清單

開發啟動前必須全部打勾：

- [ ] **統編取得**（Lorenzo 執行中）
- [ ] **Stripe 台灣帳號驗證通過**（取得 `pk_live_` / `sk_live_`、webhook secret）
- [ ] **Stripe Product 建置**：`Attraction Offer — 在地品牌診斷報告`、Price NT$1,990 one-time
- [ ] **Stripe Coupon 建置**：`UPGRADE_CREDIT_1990`（折抵額 NT$1,990、有效 30 天、單客戶限用 1 次）
- [ ] **Supabase 專案建立**（或確認改用其他 Postgres）、DB URL 取得
- [ ] **MailerLite 模板 7 封完成**：order_paid、intake_received、report_ready、d3_nudge、d14_upsell、d27_reminder、refund_confirmed
- [ ] **報告儲存方案選定**：Cloudflare R2 或 Supabase Storage（決策見 04 §x）
- [ ] **Env vars 寫入 Vercel**：`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET_DIAGNOSTIC`（webhook 建議分開獨立 endpoint）、`STRIPE_PRICE_DIAGNOSTIC`、`STRIPE_COUPON_UPGRADE`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`REPORT_SIGNING_SECRET`
- [ ] **法務 OK**：退款條款、隱私權政策對齊（處理金流需更新隱私權）

---

## 6. Open Questions（R-01 spec 矛盾 / 漏洞，待 Lorenzo 確認）

> Spec 原文因讀取權限被擋，以下依任務描述與常識推斷。Lorenzo 回覆後補回來。

1. **Q1：報告「交付」的定義？**
   Spec 說 D+3 交付，但沒定義「交付」是「寄 email 通知」還是「客戶實際點開 URL」。兩者 SLA 觸發點差 1–2 天。
   **Kael 建議**：以「系統把 `report_ready_at` 寫入 DB 的時間」為 SLA 計算點，email 失敗不影響 SLA。

2. **Q2：升級折抵的「有效期」起算點？**
   是「付款成功那一刻」還是「報告送出那一刻」？若 D+3 才送報告，30 天變成實質 27 天。
   **Kael 建議**：以 `report_ready_at + 30 天`，較公平且推薦用戶收到報告才決定升級。需在 Stripe Coupon 動態產生（`create_for_customer`）。

3. **Q3：報告交付後 7 天無條件退款 vs. 升級折抵共存衝突**
   若客戶 D+5 升級（用掉 coupon），D+9 反悔要退款，coupon 已消耗，Stripe 退款時需追蹤是否應扣回折抵金額。
   **Kael 建議**：一旦 coupon 核銷，退款改為 50%（且明文寫在退款條款）。或退款流程自動作廢 coupon（用 `stripe.promotionCodes.update({active:false})`）。

---

## 7. 開發人天估算（本份文件相關）

| 區塊 | 人天 |
|---|---|
| 本文件撰寫 + spec 來回確認 | 0.5 |
| 架構評審（Lorenzo + Kael） | 0.25 |
| Go/No-Go checklist 追蹤 | 持續 |
| **本份文件合計** | **~0.75 天** |

---

## 8. 前置依賴

- 讀取 R-01 spec 全文（目前被擋，需 Lorenzo 再貼）
- 確認資料層選型（Supabase vs. Neon）
- 確認報告儲存（R2 vs. Supabase Storage）
