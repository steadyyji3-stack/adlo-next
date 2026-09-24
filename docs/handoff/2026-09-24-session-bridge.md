# adlo 工作階段銜接紀錄｜2026-09-24

> 用途：跨視窗／跨遠端容器的狀態快照。遠端容器是臨時性的，只有 commit + push 進 repo 的東西才會留下；GA 金鑰等機密不會跟著容器保留。此文件記錄「目前系統活著什麼、角色在哪、還有哪些線頭沒收」。

## 1. 目前 repo 狀態

- `main` 已推進到 **#120**（`feat(customer): add unified outcome timeline`）。
- 這已超過本工作階段結束時的 #100（agent 還原 commit `0b755c9`）。中間的 #104 / #109 / #113 / #114 / #115 / #116 / #117 / #120 等是另一條 B1/B2/B3 計費與客戶功能線（codex 分支）陸續合併，**不是我們的內容遺失**。
- 本工作階段的成果已全數在 `main` 上（見下方查核）。

## 2. 角色（agents）狀態 — 已還原為原版 v2.0

`.claude/agents/` 上的四個角色是使用者的**原版**定義（非重建版）：

| 角色 | 檔案 | 定位 |
| --- | --- | --- |
| Ada | `adlo-ada.md` | SEO 內容 / 部落格撰稿 |
| Dior | `adlo-dior.md` | UI／設計評估 |
| Kael | `adlo-kael.md` | 前端實作 / 工具建置 |
| Rex | `adlo-rex.md` | 台中醫美等在地市場研究 |

- 對應的 slash command 也在 `.claude/commands/adlo-*.md`，遠端視窗可用 `/adlo-ada` 等直接呼叫。
- 提醒：本機另有 `~/.claude/skills/adlo-*` Skills 版本（使用者真正的原始來源）。遠端容器不帶本機 Skills，遠端用的是 repo 內的 command/agent 版本。

## 3. 已上線內容（都在 main）

**部落格（`src/lib/posts.ts`）— 一人事業啟示錄 / Pieter Levels：**
- `pieter-levels-profile-2026`（完整人物介紹，已排除 adlo 觀點）
- `pieter-levels-26-customers-2026`（來源為一則 X 短文，採「金句 + adlo 分析」格式）

**GBP / SEO 系列：**
- `gbp-post-writing-formulas-taiwan-2026`
- `gbp-post-frequency-guide-taiwan-2026`
- `google-my-business-post-examples-taiwan-2026`
- `serving-premium-clients-taiwan-2026`

**Dan Koe 連載（`src/lib/dankoe.ts`）：**
- Issue #11（`2026-w29`，「不要找利基，開一條窄道」）— Nathan May 案例併入洞見段，未獨立成篇以免誤標為 Dan Koe。

**免費工具 / 站內：**
- 廣告浪費估算器（`/tools/ad-waste`，規則引擎）。
- 黏著（retention）區塊 `ToolNextSteps` 已嵌入 12 個工具頁 + `/check`。
- `sitemap.ts` 已補齊工具頁 + `/tools`、`/check`、`/diagnostic`、`/my-week`、`/subscribe`。

## 4. 數據 / 追蹤串接

- GA4：property `533600192`、measurement ID `G-NJ13ZSMK7W`；`layout.tsx` 有 production fallback（`IS_PROD_DEPLOY` gate）。
- GTM：container `GTM-WN4QZF7D`；`docs/gtm-container-adlo.json` 91 個 enum 已修為大寫，可匯入。
- 已產出 `docs/analytics/ga4-baseline-2026-07-16.md` 基準 + `docs/strategy/traffic-growth-plan-2026h2.md` KPI 計畫。

## 5. 還沒收的線頭

1. **GA 金鑰不隨容器保留** — 要再拉 GA 數據（如 30 天對比報告），需使用者重新提供 service-account 金鑰。
2. **GSC Search Console API 仍停用** — 自動拉排名 / 曝光被擋，需先在 GCP 啟用。
3. **Rex 台中醫美清單只有部分** — 約 20 列需人工從 GSC / Maps 補齊（目前 0 live rows）。
4. **治療師保險 KOL 未查證** — Ada 已「查無此人」，等使用者提供可信來源才寫。
5. **一人事業啟示錄後續候選** — "we need more makers less coaches"、"how to build a bootstrapped startup without funding"，需使用者貼原文才翻。
6. **待辦提醒** — GA service account 權限建議從 admin 降為 viewer。

## 6. 銜接方式（新視窗接手時）

- 直接在遠端用 `/adlo-ada`、`/adlo-kael` 等下指令即可，角色已在 repo。
- `main` 受保護，遠端無法直推 → 一律走 branch + PR + squash merge。
- CI：Lint·Typecheck·Build + Secret Scan (gitleaks) + Vercel Preview。本地驗證用 `npm run verify`。
- 隱私守則沿用：只用公開 GBP 資訊、不爬 email / 個人社群、爬不到就寫「無法取得」、禁簡中與賦能/閉環/乾貨/最強等禁用詞。
