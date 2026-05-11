# Vercel auto-deploy 修復紀錄

**日期**：2026-05-12
**狀態**：✅ 已修復

## 問題

從 2026-05-04 起，main branch push 不再觸發 Vercel auto-deploy。
所有變更必須走 `vercel --prod` 強制推送，違反 CLAUDE.md §2.2。

## 根因

Vercel project 跟 GitHub repo 之間的 integration 斷了：
- Vercel GitHub App 沒裝在 `steadyyji3-stack` account
- 即使 Vercel account 有 GitHub Login Connection，App 仍需獨立安裝授權

## 修復步驟（Lorenzo 執行）

1. https://vercel.com/account/login-connections → 加 GitHub Login Connection
2. https://vercel.com/lorenzos-projects-6beb8f02/adlo-next/settings/git → Connect Git Repository
3. 走 GitHub App 安裝 flow → Only select repositories → 勾 `adlo-next`
4. 確認 Production Branch = `main`

## 驗證

本 PR merge 後應自動觸發 Vercel build + production deploy。
如成功，未來 main push 不再需要 `vercel --prod` 破例。
