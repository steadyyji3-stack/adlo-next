# 05 — MailerLite 7 封 Email 自動化

**作者**：Kael
**日期**：2026-04-20
**MCP 現況**：`adlo-kael` skill 已接 MailerLite MCP（工具前綴 `mcp__e3ba09e9-f4ee-4d8b-9044-7324128cc924__*`），可用 `create_automation` / `build_custom_automation` / `update_automation_email` 等。

---

## 1. 7 封 Email 全表

| # | Automation 名稱 | Trigger | Delay | 目的 |
|---|---|---|---|---|
| E1 | `DX-01-order-paid` | Webhook: order_paid | 即時 | 付款確認、提醒填 intake |
| E2 | `DX-02-intake-received` | Webhook: intake_received | 即時 | intake 收到、預告 D+3 交報告 |
| E3 | `DX-03-report-ready` | Webhook: report_ready | 即時 | 交付報告 URL + 升級 coupon |
| E4 | `DX-04-d3-nudge` | 付款後無 intake | Delay 72h 觸發條件 | 催促填 intake（未填者） |
| E5 | `DX-05-d14-upsell` | Webhook: report_ready + delay | 14 天（見下） | 推升級、案例社會證明 |
| E6 | `DX-06-d27-reminder` | Webhook: report_ready + delay | 27 天 | Coupon 快過期提醒 |
| E7 | `DX-07-refund-confirmed` | Webhook: refund_processed | 即時 | 退款完成通知 |

> `D+3 / 14 / 27` 在 spec 的「起算點」是 `report_ready_at`（見 01 Q2 建議）。

---

## 2. 觸發模型：Webhook 推送，不用 MailerLite 內建延遲

**決策**：所有觸發都走「Supabase / API 寫入 → 呼叫 MailerLite MCP 或 REST API 觸發」，**不倚賴 MailerLite 的內建 subscriber automation trigger**。

**理由**：
1. 觸發時機精準（event-driven，不等 MailerLite 輪詢 segment）
2. 偵錯容易（我們的 log 一查就知道哪筆失敗）
3. MCP 工具本就是這種設計（`build_custom_automation` + `add_subscriber` + `assign_subscriber_to_group`）

**實作方式**：
- MailerLite 端建 7 個 automation，trigger 都設為 **「joins group X」**（group 對應每封信：`dx-01-paid`、`dx-03-ready` 等）
- 後端事件發生時：
  1. `mcp__..._add_subscriber`（若新客戶）
  2. `mcp__..._update_subscriber`（填入 order_no、report_url、coupon_code 等 custom field）
  3. `mcp__..._assign_subscriber_to_group({ group: 'dx-01-paid' })` → MailerLite 觸發 E1

---

## 3. D+3 / D+14 / D+27 策略：delay block vs. scheduled cron

| 方案 | 優點 | 缺點 | Kael 建議 |
|---|---|---|---|
| A. MailerLite Automation 內建 `delay` 14d/27d block | 不用寫 cron；UI 可視化 | 1. 觸發點必須是「加入 group」，中途不能改；2. 客戶在延遲期間退款/退訂，延遲 email 仍會發（除非設 exit condition，但 exit 要用 group 條件即時同步）；3. 難除錯 | ❌ 不推薦 |
| B. 後端 cron（Vercel Cron）每日掃 DB，條件達成時才 assign group | 1. 狀態檢查最新（已退款、已升級的排除）；2. 邏輯集中在 DB；3. 可重放 | 需寫 cron；需自行處理「已發過」旗標 | ✅ **推薦** |
| C. 混合 | E4（D+3 未 intake）用 B；E5/E6（D+14/27）用 A，但加 exit condition | 混亂 | ❌ 選一就好 |

**選擇 B 的關鍵理由**：退款或升級後要即時停止後續 email，這是 SOP 上的硬需求。用 B 每日掃 DB 寫條件 `WHERE status NOT IN ('refunded','upgraded')` 最直觀。

---

## 4. Cron 設計

**檔案**：`src/app/api/cron/diagnostic-email-schedule/route.ts`

```ts
export async function GET() {
  // Vercel Cron 每日早上 9:00 Asia/Taipei 執行
  const now = new Date();

  // E4: 付款後 72h，報告 intake 仍未填
  const d3Targets = await db.query(`
    SELECT o.* FROM diagnostic_orders o
    LEFT JOIN diagnostic_reports r ON r.order_id = o.id
    WHERE o.status = 'paid'
      AND o.paid_at < now() - interval '72 hours'
      AND (r.intake_submitted_at IS NULL)
      AND NOT EXISTS (SELECT 1 FROM mailerlite_log WHERE order_id = o.id AND template = 'dx-04-d3-nudge')
  `);
  for (const o of d3Targets) {
    await assignGroup(o.customer_email, 'dx-04-d3-nudge', o);
    await logSent(o.id, 'dx-04-d3-nudge');
  }

  // E5: report_ready 後 14 天，未退款 / 未升級
  const d14Targets = await db.query(`
    SELECT o.*, r.ready_at, r.report_url FROM diagnostic_orders o
    JOIN diagnostic_reports r ON r.order_id = o.id
    WHERE o.status = 'report_sent'
      AND r.ready_at < now() - interval '14 days'
      AND r.ready_at > now() - interval '15 days'  -- 只發一次，不重掃
      AND NOT EXISTS (SELECT 1 FROM mailerlite_log WHERE order_id = o.id AND template = 'dx-05-d14-upsell')
  `);
  // ...

  // E6: 27 天（coupon 快過期）
  // 相同邏輯
}
```

**需要一張新 log 表**：
```sql
CREATE TABLE mailerlite_log (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES diagnostic_orders(id),
  template TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, template)  -- 避免重發
);
```
（**建議補進 02-data-model.sql**，我會在本文檔末尾列補丁）

---

## 5. Subscriber 自訂欄位（MailerLite Custom Fields）

需在 MailerLite 後台預建以下 custom field（MCP tool：`create_field`）：

| Field name | Type | 說明 |
|---|---|---|
| `order_no` | TEXT | DX-20260421-000001 |
| `full_name` | TEXT | 客戶姓名 |
| `report_url` | TEXT | 報告簽章 URL |
| `report_summary` | TEXT | 一段摘要（E3 用）|
| `upgrade_coupon_code` | TEXT | UP000001 |
| `coupon_expires_date` | DATE | 2026-05-21 |
| `credit_remaining_days` | NUMBER | 計算值（expires - now, days） |
| `intake_url` | TEXT | `/diagnostic/intake?order_no=xx&token=xx` |
| `refund_request_date` | DATE | 退款日 |
| `product_type` | TEXT | 固定 `diagnostic`（segmentation 用） |

---

## 6. 每封信模板變數清單

| Template | 變數 |
|---|---|
| E1 order_paid | {{full_name}}, {{order_no}}, {{intake_url}} |
| E2 intake_received | {{full_name}}, {{order_no}}, `expected_delivery_date`（paid_at+3d 格式化） |
| E3 report_ready | {{full_name}}, {{report_url}}, {{report_summary}}, {{upgrade_coupon_code}}, {{coupon_expires_date}} |
| E4 d3_nudge | {{full_name}}, {{intake_url}} |
| E5 d14_upsell | {{full_name}}, {{report_url}}, {{upgrade_coupon_code}}, {{coupon_expires_date}} |
| E6 d27_reminder | {{full_name}}, {{credit_remaining_days}}, {{upgrade_coupon_code}} |
| E7 refund_confirmed | {{full_name}}, {{order_no}}, `refund_amount`, `refund_date` |

---

## 7. MCP 工具對應表（建置時用）

| 動作 | MCP tool |
|---|---|
| 建 7 個 group | `create_group` ×7 |
| 建 10 個 custom field | `create_field` ×10 |
| 建 7 個 automation | `create_automation` 或 `build_custom_automation`（後者支援對話式流程） |
| 改 email 內容 | `update_automation_email` |
| 試發 | `send_test_automation` |
| 列出現況 | `list_automations`、`list_fields`、`list_resources` |

**建置順序建議**：fields → groups → 7 個 automation（每個 automation trigger = assign to group）

---

## 8. Webhook：Supabase → MailerLite wrapper

**檔案**：`src/lib/diagnostic/mailerlite.ts`

```ts
export async function triggerMailerLite(event: TemplateEvent, order: Order, extra = {}) {
  const fields = {
    order_no: order.order_no,
    full_name: order.customer_name,
    product_type: 'diagnostic',
    ...extra,
  };

  // 1. Upsert subscriber + update fields
  await mlApi.post('/subscribers', {
    email: order.customer_email,
    fields,
  });

  // 2. Assign to trigger group
  await mlApi.post(`/subscribers/${order.customer_email}/groups/${GROUP_MAP[event]}`);

  // 3. Log
  await db.query(`INSERT INTO mailerlite_log (order_id, template) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [order.id, event]);
}
```

實作時可直接用 MCP tool（Node 端無 MCP runtime → 改用 MailerLite REST API `https://connect.mailerlite.com/api/`，保留 MCP 在開發 / 日常維運使用）。

---

## 9. 退場條件 / 防止重發

| 情境 | 處理 |
|---|---|
| 客戶在 D+3 發前退款 | Cron 的 WHERE 加 `status NOT IN ('refunded','expired')` |
| 客戶在 D+14 前已升級 | 同上，排除 `upgraded` |
| Webhook 重送 | `mailerlite_log` UNIQUE(order_id, template) 擋重 |
| 客戶點取消訂閱 | MailerLite 會自動 suppress，不影響我們 DB |
| 發信 API 失敗 | Try-catch + 寫 `mailerlite_log` 前先 send，成功才 INSERT；失敗 Resend 警示 |

---

## 10. 補 02-data-model.sql 的 patch

```sql
-- 追加至 02-data-model.sql 末尾
CREATE TABLE IF NOT EXISTS mailerlite_log (
  id         BIGSERIAL PRIMARY KEY,
  order_id   UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,
  template   TEXT NOT NULL,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, template)
);
CREATE INDEX idx_ml_log_order ON mailerlite_log (order_id);
```

---

## 11. 開發人天估算

| 區塊 | 人天 |
|---|---|
| MailerLite 後台建 groups + fields（MCP 輔助） | 0.5 |
| 撰寫 7 封 email HTML / 文案（Ada 主導，Kael 協助變數）| 2（歸 Ada） |
| `src/lib/diagnostic/mailerlite.ts` wrapper | 0.5 |
| Cron handler（3 個時間點） | 1 |
| mailerlite_log 表 + migration | 0.25 |
| 測試（test subscriber drill run） | 0.75 |
| **Kael 責任小計** | **~3 天**（另 Ada 寫文案 2 天） |

## 12. 前置依賴
- MailerLite MCP 可用（已有）
- 02 schema apply + 加 mailerlite_log
- Ada 交付 7 封信的 HTML 模板

> → **MailerLite 後台 groups / fields 建置** 屬於重複操作，**下次可用 Haiku** 調 MCP 工具逐個建。
> → **email 文案撰寫** 屬於 **Ada** 的領域，Kael 只負責變數接口。
