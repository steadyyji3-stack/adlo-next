# 08 — 上線與測試計畫

**作者**：Kael
**日期**：2026-04-20
**基於**：R-01 §15（測試矩陣）、§16（時程）— spec 原文讀取被擋，以下為依描述推斷。

---

## 1. Phase 時程表（W1–W3）

### Phase 1 — W1（本週＋下週，~10 工作天）— 骨幹上線

目標：**LINE 社群內測 10 筆成單**，驗證完整流程跑得通。

| Day | 任務 | 負責 |
|---|---|---|
| D1 | Stripe 帳號啟動、Supabase 建 project、env 打通 | Lorenzo |
| D1-2 | 02 migration apply + seed 測試資料 | Kael |
| D2-3 | `src/lib/diagnostic/*` 共用 utils + Stripe wrapper | Kael |
| D3-5 | P1 checkout + P2 webhook + P3 intake + P4 orders（核心 public API） | Kael |
| D4-5 | `/diagnostic` landing page（複用 Ada 設計）+ thank-you + intake 前台 | Kael + Ada |
| D5-7 | MailerLite 7 個 automation 建 + E1/E2/E3 文案 + wrapper | Kael + Ada |
| D6-7 | A1 列表 + A3 上傳 + A4 交付 | Kael |
| D7-8 | P5 退款 + A5 退款審核 | Kael |
| D8 | E2E 測試（測試金鑰 drill run）| Kael |
| D9 | 內測 5 位白名單（團隊 + 摯友客戶） | Lorenzo |
| D10 | 修 bug + 上 production keys + 開給 LINE 社群 10 人 | Kael |

**交付物**：
- 跑通：付款 → intake → 報告交付 → 升級折抵 → 退款
- 只支援 desktop；手機版先不優化

### Phase 2 — W2（第 11–15 工作天）— 上線拓展

目標：**開啟 Ads 流量、首月目標 30–50 筆**。

| Day | 任務 |
|---|---|
| D11-12 | UTM 捕獲 + 歸因儀表板（06 文件） |
| D11-12 | GTM 7 個 event + GA4 conversion 設定（Ada） |
| D13 | Cron：對帳 + email 排程（04/05 各一支） |
| D13-14 | Admin 統計頁 + 逾期報告自動警示 Slack/Resend |
| D14 | 手機版 RWD |
| D15 | Lighthouse 驗收、a11y、Security Headers |

### Phase 3 — W3（第 16–20 工作天）— 優化與規模化

| Day | 任務 |
|---|---|
| D16-17 | 報告自動化（AI 草稿助手，Lorenzo 改寫）；節省 D+3 工時 |
| D17-18 | A/B 測試：Price NT$1,990 vs. NT$2,490 的轉單率 |
| D18-19 | D+14 upsell email A/B 文案測 |
| D19 | RBAC Phase 2 準備（若團隊擴編） |
| D20 | Phase 3 review + 下一階段 roadmap |

---

## 2. 測試矩陣

### 2.1 功能測試（Checklist）

| 流程 | 測試項 | 預期 |
|---|---|---|
| Checkout | 正常付款 | order `paid` + webhook 寫入 + E1 寄出 |
| Checkout | 信用卡拒付 | order `failed` + E 寄「付款失敗」(可選) |
| Checkout | 用戶在 Stripe 頁取消 | 回到 `/diagnostic?canceled=1`、order 留 `pending` 直到 24h 後變 `expired` |
| Webhook | 同一 event 重送 | 第二次回 `dedup: true`，DB 不變 |
| Webhook | 偽造 signature | 400 拒絕 |
| Intake | 正常填 | order `intake_done` + report queued |
| Intake | 錯誤 token | 403 |
| Intake | 未付款訂單 | 409 |
| Report | 上傳 PDF + 填摘要 + 標交付 | status `report_sent` + coupon 產生 + E3 寄出 |
| Refund | D+5 無理由退款 | 同意 → Stripe 退款 + E7 寄出 |
| Refund | D+10 超過 7 天 | API 擋下 410 |
| Refund | 已升級後退款 | 警示 + 半退款（或拒絕，依條款） |
| Upgrade | 點報告內升級連結 | 跳 `/pricing?coupon=UPxxx` + Stripe 套 NT$ 1,990 折抵 |
| Upgrade | Coupon 過期（30 天後） | Stripe 拒絕 + UI 顯示「已過期」 |

### 2.2 E2E（建議用 Playwright，Phase 2 才做）

- `tests/e2e/diagnostic-happy-path.spec.ts`：完整付款→報告→升級
- `tests/e2e/diagnostic-refund.spec.ts`：付款→退款
- 當前 repo 無 test 框架（`package.json` 無 test script）→ Phase 2 再補。Phase 1 用人工測。

### 2.3 效能測試

| 指標 | 目標 |
|---|---|
| `/diagnostic` LCP | < 2.0s |
| `/diagnostic` TBT | < 200ms |
| Checkout API p95 | < 800ms（含 Stripe call） |
| Webhook 處理 p95 | < 500ms |
| 報告頁 LCP | < 2.5s |

工具：Vercel Analytics（已裝，透過 `@next/third-parties`）+ Lighthouse。

### 2.4 安全測試

| 檢查 | 工具 |
|---|---|
| Security Headers | securityheaders.com（應 A+） |
| CVE-2025-29927 | next 16.2.1 >= 修補版（需驗） |
| Webhook signature 強制 | 手動偽造測 |
| email_hash 不可猜測 | 手動改 token 測 403 |
| Rate limit 實際生效 | 腳本連打測 429 |
| SQL injection | 所有 query 用 parameterized（Supabase client 預設）|
| XSS | React 自動 escape；user input（intake notes）不用 dangerouslySetInnerHTML |
| CSRF | admin API 檢查 cookie + `SameSite=Lax` |
| PDPA | 隱私權頁更新；email 不存 log |

---

## 3. Feature Flag 策略

**推薦：用環境變數，不上 Supabase toggle**。

| 變數 | 用途 |
|---|---|
| `NEXT_PUBLIC_DIAGNOSTIC_ENABLED` | 控制 `/diagnostic` 頁面是否可見（false 時顯示 "即將推出"）|
| `DIAGNOSTIC_CHECKOUT_ENABLED` | 控制 API 是否接受建單（false 時回 503「服務暫停」）|
| `DIAGNOSTIC_REFUND_AUTO` | 是否啟用自動退款（false 時所有退款都走人工） |

**為什麼不 Supabase toggle**：
- R-01 初期不需要「運行時切換」，deploy 一次就好
- 不想為 feature flag 引入額外依賴
- 已有 Vercel preview / production 環境隔離

**Phase 2 若要 A/B 測價格**：引入 Vercel Edge Config（原生支援，不需自建）。

---

## 4. 灰度放量方針

### 階段 1：白名單內測（Phase 1 D9）
- 5 位：Lorenzo、Ada、Rex、Kael（內部模擬）、1 位摯友客戶
- 模式：前端 `/diagnostic` 頁前置 password prompt（用 `ADMIN_SECRET` 簡單擋）
- 觀察：付款成功率、webhook 正確性、email 到達

### 階段 2：LINE 社群（Phase 1 D10 – W2 D12）
- 目標 10 筆真實付費
- 不開 Ads；發文在 LINE 社群 + Lorenzo 個人 FB
- 觀察：intake 提交率、報告交付時效、客訴量

### 階段 3：Ads 小額（Phase 2 D13+）
- 日預算 NT$ 500 Google Ads（只打核心關鍵字）
- 目標 CPA ≤ NT$ 800（推算：1,990 毛利 × 50% ≈ 1,000 可接受）
- 觀察：CPA、轉單率、升級率

### 階段 4：全量（Phase 3）
- 日預算拉到 NT$ 2,000+；Meta Ads 開啟
- 考量加 landing page A/B 變體

### Rollback 觸發條件（Kill Switch）
任一滿足立即關 `DIAGNOSTIC_CHECKOUT_ENABLED=false`：
- Stripe 付款失敗率 > 10%（可能金鑰問題）
- Webhook 失敗率 > 5%
- 連續 2 筆報告 SLA 逾期 > 24h
- 單日客訴 ≥ 3

---

## 5. 對齊 R-01 §15 測試矩陣（推斷）

若 §15 列的測試是：**單元 / 整合 / E2E / Security / Performance / Compliance** 六類，本計畫對應如下：

| §15 類別 | 本計畫位置 |
|---|---|
| 單元測試 | Phase 2（Vitest，新裝）|
| 整合測試 | Phase 1 手動 + Phase 2 Playwright |
| E2E | Phase 2 §2.2 |
| Security | §2.4 |
| Performance | §2.3 |
| Compliance (PDPA) | §2.4 + 隱私權頁更新 |

---

## 6. 上線 Day 0 Checklist

- [ ] 所有 env vars 已在 Vercel production 設定
- [ ] Stripe 從 test → live 切換：`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET_DIAGNOSTIC`
- [ ] Stripe Dashboard webhook endpoint URL 改為 production
- [ ] Supabase 資料清空（刪 test data）
- [ ] MailerLite automation 從 draft → active
- [ ] `NEXT_PUBLIC_DIAGNOSTIC_ENABLED=true`
- [ ] `robots.txt` 確認不擋 `/diagnostic`（現有 `project_adlo_security.md` 規則確認）
- [ ] Sitemap 加入 `/diagnostic`
- [ ] GA4 Conversion action 已 import Google Ads
- [ ] 備好退款 SOP 文件
- [ ] Slack / Resend 監控告警通道測過

---

## 7. 開發人天估算（本文件相關）

| 區塊 | 人天 |
|---|---|
| 人工測試執行 | 1 |
| Lighthouse / Security audit | 0.5 |
| 灰度放量監控 | 持續 |
| 上線 Day 0 checklist 執行 | 0.5 |
| **小計** | **~2 天** |

---

## 8. 彙總：R-01 全模組總人天

| 文件 | 人天 |
|---|---|
| 01 架構設計 | 0.75 |
| 02 schema + migration | 0.75 |
| 03 API 共 9 支 | 7 |
| 04 Stripe 整合 | 4.75 |
| 05 MailerLite（Kael 份） | 3 |
| 06 UTM 追蹤（Kael 份） | 1.5 |
| 07 Admin UI | 5.75 |
| 08 測試 & 上線 | 2 |
| **Kael 責任總和** | **~25.5 天** |
| Ada（email 文案 + GTM）| ~3 |
| Lorenzo（Stripe 設定 + 內測 + 報告撰寫）| ~5 |
| **全員合計** | **~33 人天** |

**壓縮到 3 週（15 工作天）可行性**：
- Phase 1 Kael 全職 → 10 天夠拚核心 MVP
- Phase 2 + Phase 3 拉長到 W2-W4，釋出壓力
- Ada 平行做 UTM + email 文案，不阻塞 Kael

---

## 9. 前置依賴
- 其他 7 份文件完成
- Stripe live keys
- Supabase production project

> → Day 0 checklist、手動測試執行、Lighthouse 跑分 **可交由 Haiku 執行**（重複性高、確認類工作）。
> → 測試用例撰寫、E2E script 細節 **可交由 Sonnet**。
