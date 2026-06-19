# adlo.tw Access Policy — 雙軌權限制度

> 落地日期：2026-05-08
> 維護人：Lorenzo（sole decider）
> 落地動因：~/Desktop/CLAUDE.md 嚴格規則 vs 日常生產速度的平衡

---

## 設計原則

**所有變更必走 PR 進入 main**（branch protection 硬性鎖）。
差別只在 **agent 是否可以自己 merge** 跟 **是否需要 Lorenzo 親自 review**。

- 低風險、高頻率 → **Track A**：agent 自合，Lorenzo 不必每次過目
- 高風險、涉及錢/客戶資料 → **Track B**：強制 Lorenzo review + merge

---

## Track A — Agent 可自合（原速度）

### 範圍（檔案路徑白名單）

- `src/lib/posts.ts` — SEO 文章內容
- `src/lib/dankoe.ts` — Dan Koe 週報
- `src/app/blog/**` — 部落格頁面
- `src/components/blog/**`
- `src/components/dankoe/**`
- `src/components/check/**`
- `src/components/post-writer/**`
- `src/components/competitor/**`
- `src/components/diagnostic/**`（前端版面，不含 backend）
- `src/components/home/**`
- `src/components/layout/**`
- `src/components/process/**`
- `src/app/tools/**` — 免費工具頁面
- `src/app/check/**`
- `src/app/diagnostic/**`（前端，不含 /api）
- `src/app/cities/**`
- `src/app/about/**`
- `src/app/cases/**`
- `src/app/contact/**`（前端表單，不含 backend）
- `src/app/process/**`
- `src/app/services/**`
- `src/app/trends/**`
- `src/app/page.tsx` — 首頁
- `src/lib/places.ts` `src/lib/scoring.ts` `src/lib/competitor.ts` — 免費工具邏輯
- `src/lib/groq.ts` — AI 內容生成（Groq free tier，無金流）
- `src/lib/gtm.ts` `src/lib/ga.ts` — 公開分析 ID
- `src/lib/cost-cap.ts` `src/lib/rate-limit.ts` — 防爆機制（不涉客戶資料）
- `prospects/**` `data/leads/**` — 公開來源蒐集的開發名單（如當鋪業者）
- `docs/blog/**` `docs/strategy/**` `docs/design/**` — 內容策略文件
- `public/**` — 靜態資源（除 `/customers/`）
- 任何純 typo / 排版 / a11y 修正

### Workflow
```
agent 切 feature branch (feat/* | fix/* | docs/*)
  → 寫 code
  → pre-commit gitleaks + lint (staged)
  → git push origin <branch>
  → gh pr create
  → CI 跑 (lint + typecheck + build + secret scan)
  → CI 全綠 → gh pr merge --auto --squash --delete-branch
  → main updated → Vercel auto-deploy
  → smoke test
```

---

## Track B — 必須 Lorenzo 親自 review + merge（新標準）

### 範圍（檔案路徑高敏感清單）

#### B1 — 金流 / 價格
- `src/app/api/checkout/**` — Stripe checkout session
- `src/app/api/stripe/**` — Stripe webhook
- `src/app/payment/**` — 付款結果頁
- `src/lib/stripe.ts` `src/lib/billing.ts`
- `src/components/pricing/**` — 價格元件
- `src/components/subscribe/SubscribePlans.tsx` — 訂閱方案
- `src/app/pricing/page.tsx`
- `src/app/subscribe/page.tsx`
- 任何 `STRIPE_PRICE_*` env 變數新增 / 修改
- 任何 `STRIPE_SECRET_KEY` `STRIPE_WEBHOOK_SECRET` 變動

#### B2 — 客戶資料 / 客戶 API
- `src/app/api/admin/**` — 後台 API
- `src/app/admin/**` — 後台頁面
- `src/app/api/submissions/**` — 客戶提交
- `src/app/api/contact/**` — 聯絡表單接收
- `src/app/api/diagnostic/**` — 診斷申請
- `src/app/api/waitlist/**` — waitlist 名單
- `src/lib/customers.ts` `src/lib/submissions.ts`
- `src/lib/types.ts`（如包含客戶 schema）
- 任何 `customers/**` `submissions/**` 資料目錄

#### B3 — 客戶 API 整合（GBP / Google Ads / 第三方）
- `src/app/api/google-ads/**`
- `src/app/api/gbp/**`
- `src/lib/google-ads.ts`
- 任何 `*_RW` `*_LIVE` `*_EDIT` token 變動
- 任何客戶帳號 OAuth credential 處理

#### B4 — 客戶歷史資訊
- `data/customers/**`（若未來建立）
- `docs/customers/**` — 客戶 case file
- 任何客戶月報範本若含實際客戶資料
- `prospects/contacted/**` — 已接觸過、有對話紀錄的名單（含個資）

#### B5 — 認證 / 安全相關
- `middleware.ts` `src/middleware.ts`
- `src/lib/auth.ts`
- `next.config.js` — security headers / CSP
- `vercel.json`
- `.env.example` — 範本變動需 review
- `.github/workflows/**` — CI 流程
- `.claude/settings.json` — agent 權限本身
- `docs/security/**` — 本政策檔自己

### Workflow
```
agent 切 feature branch
  → 寫 code
  → pre-commit gitleaks + lint (staged)
  → git push origin <branch>
  → gh pr create
  → CODEOWNERS 自動 request Lorenzo review
  → CI 跑
  → agent 不得 auto-merge（即使 CI 過）
  → Lorenzo 親自看 diff
  → Lorenzo 在 GitHub UI 點 Merge
  → main updated → Vercel auto-deploy
```

### Track B 的 PR 標題慣例
為了讓 Lorenzo 一眼識別，agent 在 Track B PR 標題加 prefix：

```
[B1-billing]  feat(checkout): 加 Stripe 季繳方案
[B2-customer] fix(admin): 修客戶提交 dedup
[B3-api]      feat(gads): 整合 Google Ads SearchStream
[B4-history]  chore(customers): 客戶月報範本更新
[B5-security] chore(auth): 改 middleware CSP
```

---

## 灰色地帶處理規則

當變動橫跨 Track A 與 Track B（例如：改 UI 又動到 backend admin）：

**規則：取嚴格的（永遠走 Track B）**

當不確定是 A 還是 B：

**規則：當作 B**——讓 Lorenzo 看一眼比偷渡 risk 低。

---

## CODEOWNERS

對應檔：`.github/CODEOWNERS`

GitHub 看到 Track B 路徑改動 → 自動 request `@steadyyji3-stack`（Lorenzo）review。
配合 branch protection `require_code_owner_reviews=true` 強制 Track B 必須有 Lorenzo approve 才能 merge。

> **注意**：branch protection 須開啟 `require_code_owner_reviews`。落地時一併套用。

---

## Token 處理（依 ~/Desktop/CLAUDE.md §4 強化）

| Token | 類別 | Agent 可用？ | 來源 |
|-------|------|------------|------|
| `GOOGLE_PLACES_API_KEY` | Track A（讀公開店家資料）| ✅ via vercel env pull | GCP Console |
| `GROQ_API_KEY` | Track A（生成內容，不涉客戶）| ✅ | Groq |
| `UPSTASH_REDIS_REST_*` | Track A（rate-limit 用）| ✅ | Upstash |
| `RESEND_API_KEY` | **Track B**（寄信給客戶）| ❌ runtime only | Resend |
| `STRIPE_SECRET_KEY` (live) | **Track B**（金流）| ❌ runtime only | Stripe |
| `STRIPE_WEBHOOK_SECRET` | **Track B** | ❌ runtime only | Stripe |
| `ADMIN_SECRET` | **Track B** | ❌ runtime only | 自訂 |
| 客戶 OAuth tokens (未來) | **Track B**（R-07 開發後）| ❌ runtime only | 客戶授權 |

未來新加 token 命名建議：
- 公開資料 / 防爆 / 內容生成 → 不加後綴
- 客戶資料 / 金流 / 寄信 → 加 `_LIVE` `_RW` `_EDIT` 後綴並列入 Track B

---

## 違規處理

agent 若誤把 Track B 變動當 Track A merge 進去：
1. **立即 revert**（在新 PR 中 git revert，不要 force push）
2. 寫 incident note 進 `docs/security/incidents/<date>-<slug>.md`
3. 通知 Lorenzo 並等指示

agent 若無法判斷：**永遠選 Track B**。

---

_本檔修改本身屬於 B5，PR merge 必須 Lorenzo 親自 review。_
