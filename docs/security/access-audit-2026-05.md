# Access & Permissions Audit — 2026-05

> **背景**：Lorenzo 在 `~/Desktop/CLAUDE.md` 落地 PocketOS 事件學到的安全規則，
> 要求 adlo.tw repo 落實對應分權機制。本檔為一次性稽核 + 修復路線圖。

---

## 1. 揭露：本 session 過去違規紀錄（規則生效前）

下列動作在規則寫成之前發生，但仍應紀錄：

| 違規項目 | 對應條款 | 約略次數 | 處理 |
|---------|---------|---------|------|
| `vercel --prod --yes` 直推 production | §2.2 | ~15 | 加入 deny list（永久阻斷）|
| `git push origin main` 直推 main | §5 | ~15 | branch protection（永久阻斷）|
| `vercel env add/rm * production` | §2.2 | 6 | 加入 deny list |
| Agent shell 持有 production write token | §4.2 | 持續 | 建議 token rotation |

---

## 2. Gap Analysis（修復前狀態）

| # | 檢查項 | 修復前 | 修復後 |
|---|--------|--------|--------|
| 1 | pre-commit hook | ❌ 無 | ✅ `scripts/git-hooks/pre-commit`（gitleaks + lint + typecheck）|
| 2 | CI workflow | ❌ 無 | ✅ `.github/workflows/ci.yml`（PR 必跑 lint + typecheck + build + gitleaks）|
| 3 | gitleaks 設定 | ❌ 無 | ✅ `.gitleaks.toml`（含 adlo 自訂 token pattern）|
| 4 | `.env.example` | ❌ 空檔 | ✅ 17 個 key 假值範本 |
| 5 | `package.json` typecheck script | ❌ 無 | ✅ `npm run typecheck` + `npm run verify` |
| 6 | git core.hooksPath | ❌ 預設 | ✅ `prepare` 自動指向 `scripts/git-hooks` |
| 7 | main branch protection | ❌ 未保護 | ⏳ PR merge 後立刻打 GitHub API 設定 |
| 8 | `.claude/settings.json` deny list | ❌ 無 | ✅ 28 條 deny rule |
| 9 | `.gitignore` cover `.env*` | ✅ 既有 | ✅ 維持 |

---

## 3. 防線設計（4 層）

### L1 — Repo 層（檔案級防護）
所有走 git 的修改必過 pre-commit + CI gate：
- pre-commit：staged file 跑 ESLint + tsc + gitleaks，任一失敗就擋住 commit
- CI：PR 跑 ubuntu-latest 全套 verify + gitleaks-action 完整歷史掃描

### L2 — Agent 工作流層
`.claude/settings.json` deny list 覆蓋三大類：
- **Vercel production**：`vercel --prod`、`vercel env add * production`、`vercel alias set` 等
- **Git destructive**：`git push --force`、`git push origin main`、`git filter-branch` 等
- **External destructive**：`gh api * -X DELETE`、`rm -rf .git`、`stripe * --live` 等

完整清單見 `.claude/settings.json`。

### L3 — GitHub branch protection（API 自動設定）
PR merge 完成後，立刻打：
```bash
gh api repos/steadyyji3-stack/adlo-next/branches/main/protection -X PUT \
  --input scripts/security/branch-protection.json
```
詳見 `scripts/security/branch-protection.json`。

### L4 — Token 分權（建議性，不阻塞）
| Token | 暴露位置 | 風險 | 建議 |
|-------|---------|------|------|
| `GOOGLE_PLACES_API_KEY` (`AIzaSy...`) | 對話明文 | 中（已限 referrer）| Rotate |
| `GROQ_API_KEY` (`gsk_scm...`) | 對話明文 | 中 | Rotate |
| `GOCSPX-twKejhxhwqe0...` | 對話明文 | 低（unused）| 看狀況 |
| `UPSTASH_REDIS_REST_TOKEN` | 對話明文 | 低（new DB）| 觀察 |

---

## 4. 修復後 Agent 工作流（新規範）

```
Lorenzo 提需求
    ↓
Agent 在 main 切 feature branch (chore/* | feat/* | fix/* | docs/*)
    ↓
Agent 寫 code
    ↓
pre-commit 自動跑：lint + typecheck + gitleaks
    ↓
git push origin <feature-branch>  ← 唯一允許的 push
    ↓
gh pr create
    ↓
GitHub CI 跑 ci.yml（lint / typecheck / build / gitleaks）
    ↓
Lorenzo 看 PR diff → review → merge
    ↓
Vercel 自動偵測 main push → auto-deploy production
```

**Agent 永遠：**
- ❌ 不能 push main / production
- ❌ 不能跑 `vercel --prod`
- ❌ 不能改 production env vars
- ❌ 不能 force push / filter-branch
- ✅ 能在 feature branch 寫 code 並開 PR
- ✅ 能 push 到 `chore/* feat/* fix/* docs/*` 分支
- ✅ 能讀 production env（透過 `vercel env pull` 拿到 `.env.production.tmp`）但只用於 debug，且該檔需手動刪

---

## 5. Token 分權命名建議（未來新加 token 用）

| 後綴 | 權限 | 使用位置 | Agent 可用？ |
|------|------|---------|------------|
| `*_RO` | read-only | Agent shell + Vercel | ✅ |
| `*_TEST` | test mode | Agent shell + Vercel preview | ✅ |
| `*_RW` | write | Vercel runtime only | ❌ |
| `*_LIVE` | production | Vercel runtime only | ❌ |
| `*_EDIT` | mutative | Vercel runtime only | ❌ |

---

## 6. 後續建議（非阻塞）

- [ ] Token rotation（GOOGLE_PLACES_API_KEY / GROQ_API_KEY）
- [ ] Vercel Project → Git → 確認 production branch 鎖定為 `main`
- [ ] GitHub Repo Settings → Code security → 開啟 secret scanning + Dependabot alerts
- [ ] 之後新加 token 一律加 `*_RO` / `*_RW` 後綴，分流不同環境

---

_落地日期：2026-05-08_
_落地人：Kael (assisted)，由 Lorenzo (sole) CONFIRM_
