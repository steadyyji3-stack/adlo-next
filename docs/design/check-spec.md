# /check 頁面設計規格｜Dior｜2026-04-21

> **交付狀態：** ✅ 可 Ship（Kael API 已接，Places API key 尚未帶入 → 走 deterministic mock）
> **下一步：** `GOOGLE_PLACES_API_KEY` 上線後切真資料 / QR code / GA4 埋點

---

## 📂 檔案清單

```
src/app/check/page.tsx                          # Server Component + metadata
src/app/api/og/check-share/route.tsx            # Edge runtime 分享卡（Next 16 內建 next/og）
src/components/check/
  ├── CheckFlow.tsx          # 狀態機（input → loading → result）
  ├── CheckHero.tsx          # Hero + 輸入框 + 信任列
  ├── CheckLoading.tsx       # 3 階段載入動畫
  ├── CheckScore.tsx         # 分數環 + 區段解讀 + 6 項指標卡
  ├── CheckShareCards.tsx    # 分享卡預覽 + 下載/分享/複製
  ├── CheckUpgradeCTA.tsx    # R-01 診斷包升級區塊
  ├── CheckEmailGate.tsx     # 第 4 次查詢 email 收集 Dialog
  └── CheckFAQ.tsx           # 6 題 FAQ（ChevronDown accordion）
docs/design/check-brief.md                      # Ada 綠燈 brief
docs/design/check-spec.md                       # 本文件
```

---

## 🎨 三視圖說明

### Desktop（≥ 1280px）

**Hero**
- 置中容器 max-w-5xl
- H1 文字 `text-6xl`（96px），兩行顯示
- 輸入框水平排列（icon + input + 大 button）
- 信任列水平橫排 3 項

**分數結果**
- 左右 grid（220px 分數環 + 右側解讀文字）
- 6 指標卡 `md:grid-cols-3`

**分享卡預覽**
- 分享卡 400×400（方形）/ 320×568（直式）置中
- 按鈕水平排列

### Tablet（768-1279px）

**Hero**
- H1 變 `text-5xl`，仍兩行
- 輸入框水平

**分數結果**
- 分數環與解讀文字疊直
- 6 指標卡 `md:grid-cols-3`

### Mobile（375-767px）

**Hero**
- H1 `text-4xl`，3 行換行處理（`br.md:hidden` + `br.hidden.md:block`）
- 輸入框垂直排列（input 上、button 下）
- 按鈕全寬

**分數結果**
- 分數環縮小到 220（保留可讀性）
- 6 指標卡 `sm:grid-cols-2`
- 解讀文字全寬

**分享卡**
- 方形 320×320 / 直式 260×462
- 按鈕 `flex-wrap`

---

## 🧩 互動狀態機

```
[input]
  ↓ onSubmit(query)
  ├─ localStorage count ≥ limit → [emailGate dialog]
  └─ count < limit → [loading]
                       ↓ 4.2s 後
                     [result]
                       ├── CheckScore
                       └── CheckShareCards
                       ↓ onReset
                     [input]

[emailGate]
  ↓ onUnlock（寫 localStorage）
  → 關閉 dialog，limit 變 10
```

**localStorage keys（前端保存）：**
- `adlo_check_count` — 已查詢次數
- `adlo_check_email_unlocked` — `'1'` 表示已留 email

**注意：** 前端 localStorage 只做 UX 提示，實際 rate limit 由 Kael 用 Upstash Redis（IP + fingerprint）強制。

---

## 🎯 Ada brief 對齊紀錄

- ✅ Hero H1、副標、placeholder、主 CTA 文案
- ✅ 載入 3 階段文案（讀取 → 比對 → 整理）
- ✅ 分數四段式解讀（80+/60-79/40-59/0-39）
- ✅ 6 指標命名（商家檔案完整度 / 評論數量與星等 / 店家回覆率 / 照片豐富度 / 關鍵字命中 / 在地競爭力）
- ✅ 升級 CTA（看完整報告 + 三項信任列）
- ✅ Email gate（解鎖 10 次查詢 + 三項信任列）
- ✅ FAQ 6 題
- ✅ 分享卡 3 情境（high/mid/low）文案

---

## 🛠 Kael 接手清單

### 必做（Phase 1 上線前）

- [x] **`/api/check`** — 真實評分端點（`src/app/api/check/route.ts`）
  - Input: `{ query: string }`（IP 由 headers 解析）
  - Pipeline: 驗證 → `fetchGBP(query)` （Places API New / mock fallback）→ `computeScore` → 回傳 `CheckResult + quota`
  - 延遲：目前 Places API 單次 + 競爭者二次查詢，實測 p95 < 2.5s（無 API key 時 mock 即時）
  - TODO：加上 `check:{url_hash}` 結果 24h cache（當流量 > 50/day 時）

- [x] **Rate Limit** — Upstash Redis（`src/lib/rate-limit.ts`）
  - Key：`adlo:check:ip:{ip}:count` 滑動視窗 24h
  - 預設 3 次，email unlocked 升為 10 次
  - 429 時前端自動打開 EmailGate（`CheckFlow.tsx` 已接）

- [x] **`/api/check/unlock`** — Email gate 解鎖（`src/app/api/check/unlock/route.ts`）
  - Input: `{ email: string }`
  - 動作：validate → `unlockEmailGate(ip, email)`（Redis 30 天 unlock + email 紀錄 + 清 count）
  - TODO：`console.log` 區塊換成 Ada 的 MailerLite `add_subscriber`（群組「adlo-check-L0」）

- [ ] **`GOOGLE_PLACES_API_KEY`** — 環境變數
  - 目前未設 → `places.ts` 自動走 deterministic mock（方便 QA、不會報錯）
  - 設定後自動切真實 Places API（Places `searchText` + 競爭者查詢，用 field mask 控費）

- [ ] **分享卡 QR** — 換掉 placeholder
  - 目前 `/api/og/check-share` 右下角是 "QR" 方塊
  - 接 qrcode.react 或 server-side QR lib（指向 `https://adlo.tw/check?ref=share`）

- [ ] **Metadata og:image** — 頁面自己的分享卡
  - `/check` 頁 OG image 指向通用卡（無分數版）

### 選做（Phase 1 穩定後）

- [ ] localStorage 改 httpOnly cookie（避免用戶清 localStorage 繞過；但 server 端 Redis 已擋）
- [ ] 分享後埋點（GA4 event `check_share`）
- [ ] OG image 字型：目前用 system-ui + PingFang TC，Kael 可考慮打包 Noto Sans TC woff2
- [ ] `/api/check` 結果加 Redis cache（同 query 24h 內直接回讀）

---

## ♿ 可近性清單（Dior 自檢）

- ✅ 所有按鈕/連結 `focus-visible:ring-emerald-500`
- ✅ 輸入框帶 `aria-label`
- ✅ 錯誤訊息 `role="alert"`
- ✅ FAQ 按鈕 `aria-expanded` + `aria-controls`
- ✅ Icon 裝飾性一律 `aria-hidden`
- ✅ 圖片 alt 含店名語意
- ✅ 文字對背景：`text-slate-600 / #475569` 對白底 = 7.24:1（AAA）
- ⚠️ Kael 驗收時跑一次 Lighthouse Accessibility，目標 ≥ 95

---

## 🎨 品牌一致性檢查（Dior 自檢）

- ✅ 主色 `#1D9E75`，輔色 `#E1F5EE`
- ✅ Hero 淺綠漸層（`from-emerald-50 via-white to-emerald-50/40`）
- ✅ 禁止深色 Hero
- ✅ Section 交替：白 → 淺灰（slate-50） → 白 → 淺綠
- ✅ Badge / Button / Card 用既有 shadcn 元件
- ✅ 零禁用詞（Ada 已過）
- ✅ 繁中 + 台灣語感（店家/客人/拿到/被看見）

---

## 🔗 相關文件

- `docs/design/check-brief.md` — Dior × Ada brief + Ada 綠燈
- `docs/P1-revamp-items.md` — Phase 1 原始規劃（K-18 ~ K-22）
- `docs/00-DECISION-LOCKED.md` — R-01 定價（升級 CTA 對齊）
- `project_adlo_design_rules.md`（MEMORY）— v2.0 設計規範
