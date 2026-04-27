# P1 改版事項｜MLP 病毒式擴散｜Lorenzo 決策鎖定 2026-04-20

> **此為 P1 Money Model 改版的單一真相源。Ada / Kael / Rex 以此為準。**
> 搭配 `00-DECISION-LOCKED.md`（R-01 定價與規格）共同構成 adlo.tw 下一階段藍圖。

---

## ✅ Lorenzo 決策鎖定

| # | 議題 | 決定 | 含意 |
|---|------|------|------|
| **1** | Layer 0 開放度 | **C** | `/check` 免費 3 次/IP，之後要留 email 才能再查 |
| **2** | 推薦拆帳 | **B（標準）** | 推薦人 -500 / 被推薦人 30% off 診斷包 |
| **3** | Layer 0 上線時機 | **A** | R-01 上線「之前」先出 /check，不等 Stripe |

---

## 🎯 Money Model 四層架構

```
L0 — /check 免費健檢工具
     ↓ 留 email / 分享卡 → 名單 + 社群聲量
L1 — R-01 診斷包 NT$1,990
     ↓ 30 天內升級折抵
L2 — 訂閱方案 Starter/Growth/Pro（8,800 / 18,800 / 32,800）
     ↓ 每季健檢 Token + 推薦 Token
L3 — 推薦機制（Referral Loop）
     ↓ 自增長
```

**核心洞見：** L0 免費工具是病毒引擎，目標不是轉換，是**把健檢結果變成社群內容**（分享卡 → 好友 → 回流）。

---

## 🧱 Phase 1｜Layer 0 先行（R-01 之前，約 1 週）

### 目標
- `/check` 上線，不依賴 Stripe
- 免費 3 次後收 email 才能再查
- 每次健檢產生分享卡（LINE/IG/FB）
- 留 email 的人 → MailerLite 加入「L0 潛在客戶」群組

### Kael 任務

| ID | 項目 | 說明 |
|----|------|------|
| K-18 | `/check` 路由 | Next.js App Router，輸入 Google Maps URL 或店名 |
| K-19 | `/api/check` 端點 | URL 驗證 → GBP 公開資料抓取 → Rule-based scoring → 產生分享卡 ID |
| K-20 | `@vercel/og` 安裝 | 動態分享卡產生（1080×1080 方形 + 1080×1920 直式） |
| K-21 | Upstash Redis 快取 | 同一 URL 24hr 內不重複抓，降低 Places API 費用 |
| K-22 | IP 限流 + Email Gate | Upstash Redis 記 IP 計數，第 4 次起阻擋，email 驗證後 reset |
| K-23 | `/pricing` 重構 | L0-L3 Money Model 排版（Ada 文案 → Kael 實作） |

**技術規格：**
- Scoring 採 **Rule-based**（不用 AI），降低延遲與費用
- Places API 為主，失敗 fallback WebFetch
- Rate limit：IP 3 次 / 24hr（留 email 後 reset 為 10 次 / 24hr）
- Email 驗證：留 email 即解鎖（不需點連結，但會發歡迎信到 MailerLite）

### Ada 任務

| ID | 項目 | 說明 |
|----|------|------|
| A-9 | `/check` 頁文案 | Hero + 分數解讀 + 升級 CTA（NT$1,990 診斷包） |
| A-10 | `/pricing` 新 Money Model 文案 | L0-L3 分層說明、價格心理學鋪陳 |
| A-11 | 分享卡文案模板 | 3-5 種情境（高分炫耀 / 低分求救 / 中分好奇） |

**分享卡設計規格：**
- 方形 1080×1080（LINE、FB）
- 直式 1080×1920（IG Stories）
- 必含：分數、店名、adlo.tw 浮水印、QR code
- 主色 #1D9E75，符合 v2.0 設計規則

---

## 🧱 Phase 2｜Referral Loop（Stripe 上線後，約 2 週）

### 目標
- R-01 診斷包交付 email 內附「送朋友 30% off Token」
- 訂閱客戶每季自動獲得「健檢 Token」可送朋友
- 推薦成交：推薦人 -500 / 被推薦人 -597（30% off 1,990）

### Kael 任務

| ID | 項目 | 說明 |
|----|------|------|
| K-24 | Referral Token 系統 | Token 產生 / 歸因 / 拆帳邏輯，Postgres 表 `referral_tokens` |
| K-25 | 診斷包交付信附 Token | MailerLite 動態欄位注入 Token URL |
| K-26 | 訂閱者每季 Token 機制 | Cron job 每季自動發送「送朋友」Token email |

**Token 規則：**
- 被推薦人結帳套用 → 自動 -30%（Stripe coupon）
- 推薦人下次訂閱月費自動折 500（或以現金回饋方式累積）
- Token 有效期 90 天
- 防刷：同 email 同裝置同 IP 去重

### Ada 任務

| ID | 項目 | 說明 |
|----|------|------|
| A-12 | Token 相關 Email 文案 | 交付信「送朋友」區塊 / 訂閱者每季 Token 信 / Token 即將到期提醒 |

---

## 🧱 Phase 3｜台灣通路病毒擴散（L0 上線後持續）

### Ada 任務

| ID | 項目 | 說明 |
|----|------|------|
| A-13 | Dcard / PTT 種子文 | 兩週內 5 篇，不硬推 adlo，以「我拿到 X 分」為切角 |
| A-14 | 地區 FB 社團名單 | 全台醫美、餐飲、在地服務社團清單 + 投放節奏 |
| A-15 | IG Reels | 「30 秒查你的店家健康度」短影音 × 3 |

### Rex 任務

| ID | 項目 | 說明 |
|----|------|------|
| R-7 | 地區排名 Top 10 外展 | 用 /check 掃各地區 Top 10 → 前 10 名以外的店家列為外展名單 |

**通路優先級：**
1. **LINE** — 分享卡最有感，群組擴散快
2. **IG Stories** — 1080×1920 直式卡適配
3. **Dcard 創業版 / 閒聊版** — 種子文切「我拿到 X 分」
4. **地區 FB 社團** — 小店主密度高
5. **PTT 創業版** — 討論度次之，但會被轉錄

---

## 📅 上線時序

```
W1（本週）：Phase 1 開工
  - Kael: K-18 ~ K-22 並行
  - Ada: A-9, A-11

W2：Phase 1 上線
  - K-23 /pricing 上 L0-L3 架構
  - A-10 文案完稿
  - /check 正式對外

W3-W4：Stripe 到位 → Phase 2
  - R-01 + Referral Token 同步上線
  - A-12 email 系列

W3 起持續：Phase 3 病毒擴散
  - A-13 ~ A-15 排程
  - R-7 外展名單
```

---

## 🚦 Guardrails（不可跨越）

- `/check` **絕不**收信用卡、身分證號、詳細個資
- 分享卡**不含**客戶私密資料（營收、聯絡人），只露公開 GBP 數據
- 推薦 Token 不可用於現金提領（只折訂閱或診斷包）
- Rate limit 由 Upstash Redis 強制，不能用前端關掉
- 所有文案過 Ada 品牌聲音稽核（無簡中語感、無業界領先/最強）

---

## 🔴 Blockers & Dependencies

| 項目 | 卡點 | 負責 |
|------|------|------|
| Stripe 台灣帳號 | 等統編 | Lorenzo |
| Phase 1 | **無 Blocker，可立即開工** | Kael + Ada |
| Phase 2 | 等 Stripe live keys | 依 Phase 1 完成度 |
| Phase 3 | 等 L0 上線累積 3-5 天數據 | 依 Phase 1 完成度 |

---

## 📐 後續變更規則

任何 P1 範圍、拆帳比例、Rate limit 數字變更需 Lorenzo 書面同意，改此檔並附變更紀錄。

---

## 📂 相關文件

- `00-DECISION-LOCKED.md` — R-01 定價與規格鎖定
- `R-01-attraction-offer.md` — 原始 spec
- `ada-pricing-revamp/` — Ada 既有產出（文案/LP/Email/社群）
- `kael-r01-architecture/` — Kael 既有產出（資料模型/API/Stripe/MailerLite）
