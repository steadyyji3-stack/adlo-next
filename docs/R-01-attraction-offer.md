# R-01 | Attraction Offer: GBP + Google Ads 健檢診斷包

| 項目 | 內容 |
|---|---|
| Spec ID | R-01 |
| Owner | Lorenzo |
| Priority | P0(MLP 第一批) |
| Sprint | Sprint 1(W1–W2) |
| Status | Draft |
| Version | 1.0 |

---

## 1. 目的與商業背景

adlo.tw 採 Money Model 三階結構(Attraction → Upsell → Continuity),本模組負責**第一階「Attraction Offer」**:用低門檻一次性付費產品建立信任、過濾高意向客戶,並為月訂閱(Growth / Pro Tier)創造轉換前置節點。

**核心命題:** 讓新訪客在不承諾月訂閱的前提下,先以 NT$1,990 體驗一次專業診斷,形成「首次付費 → 訂閱」轉換漏斗。

**North Star 指標:** Attraction → Subscription 30 天轉換率 **≥ 25%**

---

## 2. 產品定義

| 項目 | 內容 |
|---|---|
| 產品名 | GBP + Google Ads 健檢診斷包 |
| 定價 | NT$1,990(一次性) |
| 交付物 | 客製診斷報告 PDF(8–12 頁) + 5 分鐘影片解說(Loom) |
| SLA | 付款後 3 個工作日內交付 |
| 保證 | 7 天全額退費(交付後 7 日內無條件) |
| 升級優惠 | 購買後 30 天內升級訂閱,可折抵 NT$1,990 |

---

## 3. Success Criteria(Acceptance)

### 功能面
- [ ] 訪客可於 `/diagnostic` 頁面完成購買,**無需註冊訂閱**
- [ ] 付款成功後自動發送確認 email(含 order_id、預計交付時間)
- [ ] 後台可檢視訂單列表、篩選狀態、手動更新交付
- [ ] 支援 7 天內退費流程(自動 / 半自動)
- [ ] UTM 參數完整記錄於 `source_utm` JSON 欄位
- [ ] 升級訂閱時可自動折抵已付診斷費

### 數據面
- [ ] 可追蹤「診斷包購買 → 訂閱」完整漏斗
- [ ] 首月 10 筆診斷訂單成本 < NT$500/單
- [ ] 所有關鍵事件寫入 analytics(見 §11)

---

## 4. User Flows

### 4.1 購買流程(Happy Path)

```
訪客進入 /diagnostic(含 UTM)
  → 閱讀 LP、點擊「立即診斷」
  → 填寫基本資料(email、姓名、電話、公司名、網站/GBP URL)
  → 導向 Stripe Checkout
  → 付款成功
  → 建立 diagnostic_orders(status: paid)
  → 寄送確認 email(MailerLite)
  → 顯示 Thank You 頁(含下一步預期)
  → Lorenzo 後台接單,3 個工作日內交付
  → 後台上傳 PDF + Loom 連結
  → 系統寄送交付 email + 升級訂閱 CTA
  → 客戶 30 日內可選擇升級(折抵 NT$1,990)
```

### 4.2 退費流程

```
客戶於交付後 7 日內申請退費
  → 客戶點 email 中「申請退費」連結 OR 後台手動建立
  → 建立退費請求(refund_status: requested)
  → Lorenzo 於後台核准
  → Stripe API 觸發退款
  → 更新 refund_status: refunded
  → 寄送退費確認 email
```

### 4.3 升級折抵流程

```
客戶於購買診斷包後 30 日內點擊「升級訂閱」
  → 系統檢查 diagnostic_orders 中是否有該 email 之已付訂單
  → 若有且在折抵期內,訂閱首月自動折 NT$1,990
  → 更新 diagnostic_orders.upgraded_subscription_id
  → 折抵為一次性,不可重複使用
```

---

## 5. Data Model

### 5.1 `diagnostic_orders`

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid (pk) | |
| order_no | string, unique | 格式:`DX-YYYYMMDD-XXXX` |
| user_id | uuid, nullable, fk → users | 若已註冊則關聯 |
| email | string, not null | 主要識別 |
| full_name | string | |
| phone | string | |
| company_name | string | |
| target_url | string | 待診斷的網站 / GBP URL |
| amount | int | 單位:TWD,預設 1990 |
| currency | string(3) | 預設 `TWD` |
| payment_provider | enum | `stripe` / `newebpay`(預留) |
| payment_intent_id | string | 金流方訂單 ID |
| payment_status | enum | `pending` / `paid` / `failed` |
| delivery_status | enum | `not_started` / `in_progress` / `delivered` |
| refund_status | enum | `none` / `requested` / `refunded` / `rejected` |
| source_utm | jsonb | 完整 UTM 參數 |
| referrer | string | 來源網址 |
| ip_address | inet | |
| user_agent | string | |
| upgraded_subscription_id | uuid, nullable | 升級後關聯訂閱 |
| upgrade_credit_applied | bool | 預設 false |
| paid_at | timestamptz, nullable | |
| delivered_at | timestamptz, nullable | |
| refunded_at | timestamptz, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**索引:**
- `email`(查詢用)
- `payment_status`(後台篩選)
- `delivery_status`(後台篩選)
- `created_at`(排序)

### 5.2 `diagnostic_reports`

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid (pk) | |
| order_id | uuid, fk → diagnostic_orders, unique | |
| pdf_url | string | S3 / R2 URL |
| video_url | string | Loom URL |
| internal_notes | text | 僅後台可見 |
| client_feedback | text, nullable | 客戶回饋 |
| client_rating | int, nullable | 1–5 |
| delivered_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 5.3 `diagnostic_refund_requests`

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | uuid (pk) | |
| order_id | uuid, fk | |
| reason | text | |
| status | enum | `requested` / `approved` / `rejected` / `completed` |
| stripe_refund_id | string, nullable | |
| requested_at | timestamptz | |
| processed_at | timestamptz, nullable | |
| processed_by | uuid, fk → admin_users | |

---

## 6. State Machine

### 6.1 Payment Status

```
pending ──► paid ──► (final)
    └───► failed ──► (final)
```

### 6.2 Delivery Status

```
not_started ──► in_progress ──► delivered
```

**規則:** delivery_status 僅當 payment_status = `paid` 時可推進。

### 6.3 Refund Status

```
none ──► requested ──► approved ──► refunded
                  └──► rejected
```

**規則:** 僅允許 `delivered_at + 7 天` 內申請;超過則後台仍可手動例外核准。

---

## 7. API Design

### 7.1 Public APIs

#### `POST /api/diagnostic/checkout`
建立訂單並導向金流頁。

**Request:**
```json
{
  "email": "user@example.com",
  "full_name": "王小明",
  "phone": "0912345678",
  "company_name": "新亞當舖",
  "target_url": "https://example.com",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "diagnostic_q2",
    "term": "google 商家健檢",
    "content": "ad_v1"
  }
}
```

**Response:**
```json
{
  "order_id": "uuid",
  "order_no": "DX-20260418-0001",
  "checkout_url": "https://checkout.stripe.com/..."
}
```

#### `POST /api/diagnostic/webhook/stripe`
Stripe webhook receiver(驗證簽章)。

#### `GET /api/diagnostic/orders/:order_no`
客戶查詢訂單狀態(以 email hash 驗證)。

#### `POST /api/diagnostic/refund-request`
客戶申請退費。

### 7.2 Admin APIs

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/admin/diagnostic/orders` | 列表(支援 filter) |
| GET | `/api/admin/diagnostic/orders/:id` | 單筆詳情 |
| PATCH | `/api/admin/diagnostic/orders/:id/delivery` | 更新交付狀態 |
| POST | `/api/admin/diagnostic/orders/:id/report` | 上傳報告 |
| POST | `/api/admin/diagnostic/orders/:id/refund` | 核准退費 |

---

## 8. Frontend Pages

### 8.1 `/diagnostic`(Landing Page)

**結構:**
1. Hero:痛點 + 價值主張 + CTA
2. 診斷內容展示(6–8 個檢查項目)
3. 報告範例截圖(含 Loom 影片縮圖)
4. 社會證明(客戶見證、數據)
5. FAQ(至少 8 題)
6. 保證說明(7 天退費)
7. 最終 CTA

**技術要求:**
- SSR(SEO)
- Lighthouse Performance ≥ 90
- Mobile-first
- UTM 參數從 URL 自動帶入下一步表單

### 8.2 `/diagnostic/checkout`(表單 + Stripe)

- 表單驗證:email、URL 格式
- target_url 驗證是否為有效網址
- 點擊後觸發 `POST /api/diagnostic/checkout`
- 成功後 redirect 至 Stripe Checkout

### 8.3 `/diagnostic/thank-you`

- 顯示 order_no
- 預期交付時間
- 預告後續 email
- CTA:預先瞭解訂閱方案(非強制)

### 8.4 `/diagnostic/order/:order_no`

- 客戶自助查詢訂單狀態
- 進度條:已付款 → 進行中 → 已交付
- 下載報告 / 觀看影片
- 申請退費按鈕(若在 7 天內)

---

## 9. Admin UI

### 9.1 `/admin/diagnostic/orders`

**欄位:**
- 訂單編號、email、公司、金額、付款狀態、交付狀態、退費狀態、建立時間、來源

**Filter:**
- 付款狀態、交付狀態、日期範圍、UTM source

**Actions(row-level):**
- 檢視、更新交付狀態、上傳報告、退費

### 9.2 `/admin/diagnostic/orders/:id`

- 完整訂單資訊
- UTM / referrer / IP 資料
- 交付報告上傳區(PDF + Loom URL)
- 退費請求(若有)
- 活動紀錄(timeline)

---

## 10. 金流整合(Stripe)

### 10.1 設定
- 產品:`Diagnostic Package` one-time payment TWD 1,990
- Webhook events:`checkout.session.completed`、`charge.refunded`
- Webhook 簽章驗證必做

### 10.2 流程
1. Backend 呼叫 `stripe.checkout.sessions.create()`
2. 將 `diagnostic_orders.id` 放入 `metadata`
3. Webhook 接收後以 metadata 找回訂單,更新 payment_status
4. 失敗 3 次未更新者,發內部 alert

### 10.3 備援方案
- 若客戶無法使用 Stripe(不支援台幣 / 信用卡失敗),預留 `newebpay`(藍新)欄位,V2 再接

---

## 11. Email 通知(透過 MailerLite MCP)

| 事件 | Email 模板 | 觸發點 |
|---|---|---|
| 付款成功 | `diagnostic_paid` | payment_status → paid |
| 交付完成 | `diagnostic_delivered` | delivery_status → delivered |
| 退費申請收到 | `refund_requested` | refund request created |
| 退費完成 | `refund_completed` | refund_status → refunded |
| 升級提醒(D+3) | `upgrade_reminder_1` | 交付後第 3 天 |
| 升級提醒(D+14) | `upgrade_reminder_2` | 交付後第 14 天 |
| 折抵到期前(D+27) | `upgrade_expiry` | 交付後第 27 天 |

**實作:** 透過 MailerLite MCP 的 automation triggers,以 webhook 或 API call 觸發。

---

## 12. Analytics 事件

寫入 GA4 + 內部 events 表:

| 事件名 | 觸發點 | Properties |
|---|---|---|
| `diagnostic_lp_view` | 進入 LP | utm_* |
| `diagnostic_checkout_start` | 點擊 CTA | utm_*, order_id |
| `diagnostic_form_submit` | 表單送出 | order_id |
| `diagnostic_payment_success` | Stripe webhook | order_id, amount |
| `diagnostic_delivered` | 交付 | order_id, days_to_deliver |
| `diagnostic_upgrade` | 升級訂閱 | order_id, subscription_id |
| `diagnostic_refund` | 退費完成 | order_id, reason |

---

## 13. UTM 追蹤規格

**必存欄位:** `utm_source`、`utm_medium`、`utm_campaign`、`utm_term`、`utm_content`、`referrer`、`landing_page`、`first_touch_at`

**First-touch vs Last-touch:**
- cookie 保存 first-touch UTM(90 天)
- 結帳時同時寫入 first 與 last

---

## 14. 交付 SOP(Lorenzo 作業)

1. 每日上午 10:00 檢查 `delivery_status = not_started` 訂單
2. 於後台點「開始處理」→ `in_progress`
3. 執行診斷(target_url 的 GBP + Ads 健檢)
4. 使用 PDF 模板填入診斷結果
5. Loom 錄製 5 分鐘解說(螢幕 + 人頭)
6. 後台上傳 PDF + Loom URL
7. 點「交付」→ 系統自動寄 email
8. SLA:付款後 3 個工作日內完成

**備援:** 若 Lorenzo 外出 > 2 天,後台可設定 `maintenance_mode`,LP 自動隱藏 CTA。

---

## 15. Testing Checklist

### 15.1 功能測試
- [ ] 表單驗證正確(email、URL)
- [ ] Stripe 成功 / 失敗流程
- [ ] Webhook 重送不會重複建單
- [ ] 退費金額正確
- [ ] 升級折抵僅能用一次
- [ ] UTM 參數完整落庫

### 15.2 E2E 測試
- [ ] 完整購買 → 交付 → 升級路徑
- [ ] 完整購買 → 退費路徑

### 15.3 效能
- [ ] LP Lighthouse ≥ 90
- [ ] API p95 < 500ms

### 15.4 安全
- [ ] Stripe webhook 簽章驗證
- [ ] Admin routes 權限檢查
- [ ] 客戶查詢頁以 email hash 驗證,非只靠 order_no

---

## 16. Rollout 計畫

### Phase 1(W1)
- Migration + API + LP + Stripe
- 內部測試 3 筆

### Phase 2(W2)
- Admin UI + Email 自動化
- Soft launch:先推給現有 LINE / FB 社群,目標 10 筆訂單
- 每筆完成後記錄:交付時間、客戶滿意度、是否升級意向

### Phase 3(W3+)
- 根據 10 筆回饋校準 Offer(定價 / 內容 / 文案)
- 開啟 Google Ads 自投($2,000/月測試預算)

---

## 17. Out of Scope(本版不做)

- 藍新金流整合(V2)
- 自動診斷(AI 產報告)—— 交付人工為主
- 多幣別支援
- 發票開立自動化(先手動)
- Affiliate / 推薦機制(獨立 spec 處理)

---

## 18. 風險與對策

| 風險 | 影響 | 對策 |
|---|---|---|
| Stripe 台灣收款成功率低 | 直接斷漏斗 | 預留藍新接口、監控支付成功率 |
| 交付 SLA 破 | 客訴、退費率升 | 後台 alert、容量上限限制(每週 max 訂單數) |
| 診斷品質不一 | 低升級率 | PDF 模板標準化、Loom 錄製腳本 |
| UTM 遺失 | 無法歸因 | First-touch cookie + server-side 備援 |

---

## 19. 後續關聯 Spec

- **R-02** Quiz → Tier 映射引擎(升級路徑接駁)
- **R-05** CAC / GP 儀表板(本模組為首要數據來源)
- **R-03** Downsell(結帳放棄者承接)

---

## 20. Sign-off

| 角色 | 姓名 | 日期 |
|---|---|---|
| Product | Lorenzo | |
| Engineering | Lorenzo (Claude Code) | |
| Review | | |
