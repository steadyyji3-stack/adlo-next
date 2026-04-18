# adlo GTM 容器設定指引｜Kael 2026-04-18

## 狀態
- GTM Container ID: `GTM-WN4QZF7D`
- GA4 Measurement ID: `G-NJ13ZSMK7W`
- 網站程式碼已埋點完成（dataLayer push）

## 網站已上拋的事件（dataLayer）

| Event Name | 觸發時機 | 帶的參數 |
|------------|---------|---------|
| `contact_form_submit` | /contact 表單成功送出 | form_id, industry, service, challenges_count |
| `pricing_plan_click` | /pricing 三方案按鈕點擊 | plan_id, billing |
| `adlo_interaction` | 任何 `[data-gtm-event]` 元素被點擊 | interaction_name, link_url, platform, location |

## 已埋點的 `data-gtm-event` 位置

| 位置 | data-gtm-event 值 | 額外屬性 |
|------|------------------|---------|
| SiteNav「立即諮詢」CTA | `nav_contact_cta_click` | — |
| Footer LINE icon | `line_click` | platform=line, location=footer |
| Footer IG icon | `social_click` | platform=instagram, location=footer |
| Footer FB icon | `social_click` | platform=facebook, location=footer |
| Footer X icon | `social_click` | platform=x, location=footer |
| Footer email link | `email_click` | location=footer |

---

## 匯入容器的兩條路

### 路線 A：JSON 匯入（推薦，3 分鐘）

1. GTM 後台 → 選 `adlo.tw` 容器
2. 左下「**管理**」→ **匯入容器**
3. 選擇檔案：`adlo-next/docs/gtm-container-adlo.json`
4. 工作區：**新工作區**（名稱：`adlo initial setup`）
5. 選項：**合併** → **覆寫現有的標籤、觸發條件和變數**
6. 按「**確認**」→ 匯入
7. 如果跳錯誤，改走路線 B

### 路線 B：手動設定（10 分鐘，最穩）

依以下順序建立。

#### Step 1：建立 Data Layer Variables（10 個）
左側「**變數**」→「**使用者定義的變數**」→ **新增**

每個變數：
- 類型：**資料層變數**
- 名稱（見下表）
- 資料層變數名稱（跟 Name 一樣，不加前綴）

| 變數名稱 | 資料層變數名稱 |
|---------|---------------|
| `DLV - form_id` | `form_id` |
| `DLV - industry` | `industry` |
| `DLV - service` | `service` |
| `DLV - challenges_count` | `challenges_count` |
| `DLV - plan_id` | `plan_id` |
| `DLV - billing` | `billing` |
| `DLV - interaction_name` | `interaction_name` |
| `DLV - link_url` | `link_url` |
| `DLV - platform` | `platform` |
| `DLV - location` | `location` |

#### Step 2：啟用內建變數
左側「**變數**」→「**內建變數**」→ **設定** → 勾選：
- Page URL, Page Path, Page Hostname, Referrer, Event
- Click Element, Click URL
- Scroll Depth Threshold, Scroll Depth Units

#### Step 3：建立 Triggers（4 個）

**Trigger 1: Custom Event - contact_form_submit**
- 類型：自訂事件
- 事件名稱：`contact_form_submit`
- 觸發：所有自訂事件

**Trigger 2: Custom Event - pricing_plan_click**
- 類型：自訂事件
- 事件名稱：`pricing_plan_click`

**Trigger 3: Custom Event - adlo_interaction**
- 類型：自訂事件
- 事件名稱：`adlo_interaction`

**Trigger 4: Scroll Depth - 75%**
- 類型：捲動頁數
- 勾選：垂直捲動頁數
- 百分比：`75`
- 啟用此觸發條件：**Window Loaded**
- 觸發：所有網頁

#### Step 4：建立 Tags（5 個）

**Tag 1: GA4 Configuration - adlo**
- 類型：Google 代碼 / Google Tag
- 標記 ID：`G-NJ13ZSMK7W`
- 觸發條件：Initialization - All Pages（或 All Pages）

**Tag 2: GA4 Event - contact_form_submit**
- 類型：Google Analytics: GA4 事件
- 評估 ID：`G-NJ13ZSMK7W`
- 事件名稱：`contact_form_submit`
- 事件參數：
  - `form_id` = `{{DLV - form_id}}`
  - `industry` = `{{DLV - industry}}`
  - `service` = `{{DLV - service}}`
  - `challenges_count` = `{{DLV - challenges_count}}`
- 觸發條件：Trigger 1

**Tag 3: GA4 Event - pricing_plan_click**
- 評估 ID：`G-NJ13ZSMK7W`
- 事件名稱：`pricing_plan_click`
- 事件參數：
  - `plan_id` = `{{DLV - plan_id}}`
  - `billing` = `{{DLV - billing}}`
- 觸發條件：Trigger 2

**Tag 4: GA4 Event - adlo_interaction**
- 評估 ID：`G-NJ13ZSMK7W`
- 事件名稱：`{{DLV - interaction_name}}` ← 動態，會變成 line_click / social_click / email_click...
- 事件參數：
  - `interaction_name` = `{{DLV - interaction_name}}`
  - `link_url` = `{{DLV - link_url}}`
  - `platform` = `{{DLV - platform}}`
  - `location` = `{{DLV - location}}`
- 觸發條件：Trigger 3

**Tag 5: GA4 Event - scroll_75**
- 評估 ID：`G-NJ13ZSMK7W`
- 事件名稱：`scroll_75`
- 事件參數：
  - `page_path` = `{{Page Path}}`
- 觸發條件：Trigger 4

---

## 驗證

1. GTM 右上角「**預覽**」
2. 輸入 `https://adlo.tw` → Connect
3. 新分頁打開 adlo.tw，底部出現 Tag Assistant Connected
4. 測試：
   - 點 Footer LINE icon → Tag Assistant 應顯示 `adlo_interaction` 事件 + `GA4 Event - adlo_interaction` tag fired
   - 點 `/pricing` 任一方案按鈕 → `pricing_plan_click` fired
   - 送出 `/contact` 表單 → `contact_form_submit` fired
   - 讀文章到 75% → `scroll_75` fired
5. 都 OK 後，GTM 右上角 **發布** → 新版本名稱：`v1 - initial adlo tracking`

---

## 發布後驗證 GA4

1. https://analytics.google.com → adlo.tw → **管理** → **事件**
2. 30 分鐘內應該看到新事件：`contact_form_submit`, `pricing_plan_click`, `line_click`, `social_click`, `email_click`, `scroll_75` 等
3. 把重要事件標記為**關鍵事件**（轉換）：
   - ✅ `contact_form_submit`（最重要）
   - ✅ `pricing_plan_click`
   - ✅ `line_click`

---

## 之後要加新事件的流程（3 步驟）

1. 在任何元素加 `data-gtm-event="your_event_name"` → 自動上拋
2. 不用改 GTM（adlo_interaction tag 會自動轉發）
3. 在 GA4 → 自訂維度 / 關鍵事件 那邊設定分析

**Ada 寫 CTA 可以自己加 `data-gtm-event="blog_cta_click"` 之類的，不需要找 Kael。**
