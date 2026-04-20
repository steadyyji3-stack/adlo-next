# 定價與 Spec 決策鎖定｜Lorenzo｜2026-04-20

> **此為 R-01 + 方案改版的單一真相源。Ada / Kael / 未來所有 agent 以此為準。**

---

## ✅ 決策 1｜定價維持現價（選項 A）

Ada 獨立市場研究後反建議維持，理由：R-01 折抵機制已解決心理門檻問題，降價只會傷品牌定位。Lorenzo 拍板採納。

| 方案 | 月費 | R-01 折抵後首月實付 | 年繳 85 折 |
|------|------|---------------------|------------|
| Starter 基礎版 | **NT$8,800** | NT$6,810 | NT$7,480/月 |
| Growth 成長版 | **NT$18,800** | NT$16,810 | NT$15,980/月 |
| Pro 旗艦版 | **NT$32,800** | NT$30,810 | NT$27,880/月 |
| 診斷包（R-01 Attraction） | **NT$1,990** 一次性 | — | — |

---

## ✅ 決策 2｜R-01 規格三漏洞（Kael 提出）

| 漏洞 | Lorenzo 決定 |
|------|-------------|
| ① 「交付」時間定義 | **email 寄出當下**（`email_sent_at`）為 delivered_at 觸發點 |
| ② 升級折抵 30 天起算 | **付款時起算**（`paid_at + 30 days`） |
| ③ 已用折抵升級後退款 | **條款禁止** — 客戶使用升級折抵後即視為完成消費，不受理訂閱退費對診斷包的回溯退款 |

---

## 🎯 Kael 實作檢查點

- [ ] `diagnostic_orders.delivered_at` 在系統**發送交付 email 成功**後 set（不是後台按鈕）
- [ ] `upgraded_subscription_id` 記錄升級時要 check `paid_at + 30 days`（**不是** delivered_at + 30）
- [ ] Stripe checkout flow 若帶 coupon `DIAGNOSTIC_CREDIT_1990` 的訂閱 session，建立後需在 `diagnostic_orders.upgrade_credit_applied = true`；此筆之後的退款請求（無論訂閱或診斷包）**後台自動擋，不走自助**
- [ ] 條款頁要明寫此規則（Lorenzo 撰寫條款原文，Ada 可協助潤稿）

---

## 📋 Ada 已完成產出

路徑：`docs/ada-pricing-revamp/`
- `01-new-pricing-structure.md` — /pricing 頁改版結構
- `02-diagnostic-lp-copy.md` — /diagnostic LP 七段文案
- `03-email-sequence.md` — 7 封 Email
- `04-launch-social-posts.md` — Threads × 3 + IG × 2
- `05-pricing-decision-brief.md` — 市場分析（選項 A 採納）

## 📋 Kael 已完成產出

路徑：`docs/kael-r01-architecture/`
- `01-overview-and-risks.md` | `02-data-model.sql` | `03-api-design.md`
- `04-stripe-integration.md` | `05-mailerlite-automation.md` | `06-utm-tracking.md`
- `07-admin-ui-plan.md` | `08-rollout-and-testing.md`

## 📋 R-01 原文

路徑：`docs/R-01-attraction-offer.md`（已自 ~/Downloads 複製進專案，後續 agent 可讀）

---

## 🔴 單一 Blocker

**Stripe 台灣帳號申請（需統編）** — Lorenzo 手上。在此之前：
- Supabase 建置、MailerLite 模板、R2 儲存、/diagnostic 靜態頁可並行
- E2E 測試與正式上線必須等 Stripe live keys

---

## 📐 後續變更規則

任何定價 / 決策變更需 Lorenzo 書面同意，改此檔並附變更紀錄。
