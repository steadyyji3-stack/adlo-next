# adlo GTM / GA4 事件清單｜Kael × Ada｜2026-04-21

> **GA4 ID：** `G-NJ13ZSMK7W`
> **GTM ID：** `GTM-WN4QZF7D`
> **載入點：** `src/app/layout.tsx`（`@next/third-parties/google` 的 `<GoogleTagManager />` + `<GoogleAnalytics />`）
> **事件 helper：** `src/lib/gtm.ts`
> **自動點擊攔截：** `src/components/tracking/ClickTracker.tsx`（監聽 `[data-gtm-event]`）

---

## 📊 全站事件列表

### 🟢 已串接（/check 免費健檢漏斗）

| 事件名稱 | 觸發時機 | 關鍵參數 | 用途 |
|---------|---------|---------|------|
| `check_submit` | 使用者送出店家查詢（呼叫 `/api/check` 前） | `query_length` | 輸入行為 |
| `check_result` | 成功取得分數回來 | `score`、`score_band`（high/mid/low/poor）、`weakest_metric`、`region_rank_percent`、`location` | 分析哪類店家來測 |
| `check_rate_limited` | 觸發每日額度（客端 / server 端 429）| `source`（client / server）| 判斷是否 email gate 值得調整 |
| `check_email_unlock` | Email gate 表單成功解鎖 | — | **L0 → L1 轉換核心指標** |
| `check_share` | 分享卡被下載 / 分享 / 複製 / 點升級 | `share_action`、`score_band`、`card_size`（square/story） | 哪類分數最常被分享 |

### 🟢 已串接（/diagnostic R-01 漏斗）

| 事件名稱 | 觸發時機 | 關鍵參數 | 用途 |
|---------|---------|---------|------|
| `adlo_interaction` | `/diagnostic` 或 `/check` 頁 CTA 被點（透過 ClickTracker）| `interaction_name: diagnostic_cta_click`、`ctaLocation`（hero / final_cta / check_upgrade_cta）、`link_url` | **R-01 購買意願** |

> 注意：`diagnostic_cta_click` 統一走 ClickTracker 既有 `adlo_interaction` 事件 + `interaction_name` 參數，不另開事件名稱（和 LINE/pricing 其他 CTA 保持一致）。GTM 裡可再用 Trigger 依 `interaction_name` 拆成獨立事件到 GA4。

### 🟡 已有（其他頁面既有事件）

| 事件名稱 | 來源檔案 |
|---------|---------|
| `pricing_plan_click` | `src/components/pricing/CheckoutButton.tsx` |
| `contact_form_submit` | `src/components/contact/ContactForm.tsx` |
| `adlo_interaction` | ClickTracker 全站監聽 `[data-gtm-event]` |

---

## 🎯 GA4 建議自訂轉換

進 GA4 → 設定 → 事件 → 將以下標記為「關鍵事件 / Conversion」：

1. **`check_email_unlock`** — L0 → L1 email 收集
2. **`adlo_interaction`（filter `interaction_name=diagnostic_cta_click`）** — R-01 購買起點
3. **`contact_form_submit`** — 月訂閱方案銷售線索
4. **`pricing_plan_click`** — 訂閱方案選購意願

---

## 🏗️ GTM Trigger 建議配置

### Trigger 1：Check Funnel Start
- Trigger type: Custom Event
- Event name: `check_submit`
- Tag: GA4 Event → `check_submit`

### Trigger 2：Check Funnel Complete
- Trigger type: Custom Event
- Event name: `check_result`
- Tag: GA4 Event → `check_result`，params 透傳

### Trigger 3：Email Gate Conversion（關鍵轉換）
- Trigger type: Custom Event
- Event name: `check_email_unlock`
- Tag: GA4 Event → `generate_lead`（GA4 推薦事件名）

### Trigger 4：Diagnostic CTA Click
- Trigger type: Custom Event
- Event name: `adlo_interaction`
- Condition: `interaction_name` equals `diagnostic_cta_click`
- Tag: GA4 Event → `begin_checkout`（GA4 建議標準事件）

### Trigger 5：Share Card Action
- Trigger type: Custom Event
- Event name: `check_share`
- Tag: GA4 Event → `share`（GA4 建議標準事件），帶 `method=share_action`

---

## 🔁 事件上拋 → GA4 Event → 轉換目標對照

```
/check 漏斗（L0 免費工具層）

  check_submit  ──┐
                  ├─> GA4 funnel 報表
  check_result  ──┤
                  ├─> 分析放棄點
  check_rate_limited ─ 輔助
                  │
  check_email_unlock ──> 🔑 關鍵事件 generate_lead
                  │
  check_share（upgrade_cta）──┐
                              │
                              ↓
/diagnostic 漏斗（R-01 NT$1,990）

  adlo_interaction / diagnostic_cta_click ──> 🔑 關鍵事件 begin_checkout
  （ 後續 Stripe / ECPay checkout 成功 → purchase 事件 — 待接 ）
```

---

## 🧪 驗證步驟（Kael 自測）

1. **本地驗證**
   ```
   pnpm dev
   開啟 /check → 打開 Chrome DevTools Console
   輸入 `window.dataLayer` → 確認有事件被 push
   ```

2. **GTM Preview Mode**
   - 進 GTM 後台 → Preview
   - 連線本站 → 執行 check / diagnostic CTA 各一次
   - 確認每個事件都在左側 Event 欄被捕捉

3. **GA4 DebugView**
   - 開啟 Chrome 擴充 "GA Debugger" 或網址加 `?gtm_debug=x`
   - 進 GA4 → 設定 → DebugView → 即時看到事件進帳

---

## 📝 檔案索引

- `src/lib/gtm.ts` — 事件 helper 函式（`pushEvent` / `trackCheckSubmit` / ...）
- `src/app/layout.tsx` — GTM / GA4 初始化
- `src/components/tracking/ClickTracker.tsx` — 全站 `[data-gtm-event]` 點擊監聽
- `src/components/check/CheckFlow.tsx` — `check_submit` / `check_result` / `check_rate_limited`
- `src/components/check/CheckEmailGate.tsx` — `check_email_unlock`
- `src/components/check/CheckShareCards.tsx` — `check_share`
- `src/components/check/CheckUpgradeCTA.tsx` — `data-gtm-event="diagnostic_cta_click"`（check 頁內升級）
- `src/app/diagnostic/page.tsx` — Hero / 底部 CTA 皆帶 `data-gtm-event="diagnostic_cta_click"`

---

## 🚧 尚欠

- [ ] `/diagnostic` checkout 成功後的 `purchase` 事件（等 ECPay sandbox 上線後補）
- [ ] 訂閱升級成功後的 `subscribe` 事件（同上）
- [ ] GA4 Attribution 設定為「data-driven」
- [ ] GTM 發布版本（目前事件在 dataLayer 就位，Tag 需 Lorenzo 到 GTM 後台配）
