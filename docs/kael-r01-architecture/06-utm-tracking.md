# 06 — UTM 歸因策略

**作者**：Kael
**日期**：2026-04-20
**現況**：GTM-WN4QZF7D 已上，GA4 G-NJ13ZSMK7W 已接，`src/lib/gtm.ts` 有 `pushEvent` helper。

---

## 1. 歸因模型：First-touch（首次接觸）

**為什麼 first-touch**：
- R-01 的漏斗週期跨 14–30 天（付款 → 報告 → 升級）
- Last-click 在這種長週期下會把功勞全給「報告 email 內的升級按鈕」，高估 email、低估 Ads
- First-touch 對 Ads / Social 的 ROI 計算比較公平

**例外**：GA4 預設仍是 data-driven attribution，我們**不改 GA4**，只在自家 DB 存 first-touch，作為業務判讀用。

---

## 2. 三層 UTM 捕獲策略

### Layer 1：Client-side Cookie（主要）

**Cookie 規格**：
| 項目 | 值 |
|---|---|
| Name | `adlo_utm_ft` |
| Value | JSON.stringify({ source, medium, campaign, term, content, gclid, fbclid, referrer, landing_path, first_touch_at }) |
| Domain | `.adlo.tw`（允許子網域共享）|
| Max-Age | **90 days**（同 GA4 cookie 預設）|
| Path | `/` |
| Secure | `true` |
| SameSite | `Lax`（第三方連入時仍送出）|
| HttpOnly | **false**（前端需讀取，checkout 時打包進 POST body） |

**寫入時機**：
- 用戶第一次 landing 到任何 adlo.tw 頁面
- 若 cookie 已存在 → **不覆蓋**（first-touch 原則）
- 若 cookie 已存在但是空 UTM（例如直接輸入網址進來），而此次有 UTM → 覆蓋（升級為有來源）

**實作位置**：新建 client component `src/components/tracking/UtmCapture.tsx`，在 `layout.tsx` 載入。

```tsx
'use client';
import { useEffect } from 'react';

export function UtmCapture() {
  useEffect(() => {
    const existing = document.cookie.split('; ').find(c => c.startsWith('adlo_utm_ft='));
    const params = new URLSearchParams(window.location.search);
    const currentHasUtm = params.has('utm_source') || params.has('gclid') || params.has('fbclid');

    if (existing) {
      try {
        const parsed = JSON.parse(decodeURIComponent(existing.split('=')[1]));
        if (parsed.source || parsed.gclid || parsed.fbclid) return; // 已有來源，尊重 first-touch
      } catch { /* fall through */ }
    }

    if (!currentHasUtm && !existing) {
      // 純直接訪問，仍寫一筆空的以鎖定 first-touch
    }

    const data = {
      source:   params.get('utm_source')   || '',
      medium:   params.get('utm_medium')   || '',
      campaign: params.get('utm_campaign') || '',
      term:     params.get('utm_term')     || '',
      content:  params.get('utm_content')  || '',
      gclid:    params.get('gclid')        || '',
      fbclid:   params.get('fbclid')       || '',
      referrer: document.referrer          || '',
      landing_path: window.location.pathname,
      first_touch_at: new Date().toISOString(),
    };

    document.cookie = `adlo_utm_ft=${encodeURIComponent(JSON.stringify(data))}; Path=/; Max-Age=${90*86400}; SameSite=Lax; Secure`;
  }, []);

  return null;
}
```

### Layer 2：Session-storage（last-touch 備援）

同時在 sessionStorage 存 `adlo_utm_lt`（last-touch），在退款 / 客訴分析時還能知道「他這次進來從哪看到」。不參與寫入 DB，只做查詢。

### Layer 3：Server-side Referrer（fallback）

若 client JS 因為隱私插件 / Safari ITP 拿不到 cookie，`/api/diagnostic/checkout` 伺服器端再備援記錄：
- 從 `Referer` header
- 從 request IP 的 header（Vercel 會有 `x-vercel-ip-country` 等）

```ts
// checkout route.ts
const fallbackUtm = {
  referrer: req.headers.get('referer') ?? '',
  country:  req.headers.get('x-vercel-ip-country') ?? '',
  ua:       req.headers.get('user-agent') ?? '',
};
// merge：以 body.utm 為主，空欄位才用 fallback
```

---

## 3. 寫入 `source_utm` JSON 時機與結構

### 時機
**只在 `/api/diagnostic/checkout` 建立 order 時寫一次**。後續 webhook、intake 都不動。

### JSON 結構（對應 02 schema 的 `diagnostic_orders.source_utm`）
```jsonc
{
  "source":         "google",
  "medium":         "cpc",
  "campaign":       "dx-launch-2026q2",
  "term":           "台中醫美診所行銷",
  "content":        "ad-v2-headline-3",
  "gclid":          "EAIaIQob...",
  "fbclid":         "",
  "referrer":       "https://www.google.com/",
  "landing_path":   "/diagnostic",
  "first_touch_at": "2026-04-18T03:12:44.003Z",

  // server-side fallback（僅在 client 無資料時填）
  "server_referrer":"https://www.google.com/",
  "server_country": "TW",
  "server_ip_hash": "a1b2...",   // IP 做 sha256 截 16 字，合 PDPA

  // 歸因邏輯元資料
  "attribution_model": "first_touch_90d",
  "captured_layer":    "client_cookie"  // client_cookie | server_fallback
}
```

---

## 4. 與 GA4 事件對映（R-01 §12 七個 events）

假設 §12 七個 event 命名為（推斷）：
1. `diagnostic_page_view`
2. `diagnostic_cta_click`
3. `diagnostic_checkout_start`
4. `diagnostic_purchase`（GA4 標準 e-commerce event `purchase`）
5. `diagnostic_intake_submit`
6. `diagnostic_report_view`
7. `diagnostic_upgrade_click`

**對映表**：

| # | Event | 觸發位置 | params | 對應 `src/lib/gtm.ts` |
|---|---|---|---|---|
| 1 | `diagnostic_page_view` | `/diagnostic` 載入 | `landing_from`, `utm_source` | 新增 `trackDiagnosticView()` |
| 2 | `diagnostic_cta_click` | 頁面 CTA 點擊 | `cta_id` | 用既有 `trackInteraction` |
| 3 | `diagnostic_checkout_start` | 按「立即付款」| `email_hash`（匿名化） | 新增 helper |
| 4 | `purchase` | success page（webhook 無法觸 GA，需在 /thank-you 頁發） | `transaction_id=order_no`, `value=1990`, `currency=TWD`, `items=[{item_id:'diagnostic'}]` | 新增 `trackPurchase()`；**注意**：必須用 `transaction_id` 去重，GA4 30 分鐘內相同 `transaction_id` 算重複 |
| 5 | `diagnostic_intake_submit` | intake 表單成功 | `order_no` | 新增 |
| 6 | `diagnostic_report_view` | 報告頁載入 | `order_no`, `days_since_purchase` | 新增 |
| 7 | `diagnostic_upgrade_click` | 報告內升級按鈕 | `order_no`, `coupon_code` | 新增 |

**GTM 設定需求**（非程式碼，Ada / Lorenzo 執行）：
- 新增 7 個 Custom Event trigger
- 新增 GA4 Event tag × 7
- `purchase` 事件要在 GA4 標為 Key Event（前身 Conversion）
- Google Ads 匯入 GA4 `purchase` 作為 Conversion action

---

## 5. 退款 / 重複 / 跨裝置處理

| 情境 | 對策 |
|---|---|
| 客戶 D+5 退款 | GA4 `refund` event 同樣送（server 觸不了，在 admin 後台退款成功跳轉頁發），帶 `transaction_id=order_no`。Google Ads 會自動沖銷 Conversion |
| 同一 email 兩筆訂單（少見）| DB 每筆單獨 `source_utm`，首單 first-touch、次單 first-touch 可能不同（新 cookie 或 cookie 被清除）→ OK |
| iOS Safari ITP 擋 cookie | `adlo_utm_ft` 因 SameSite=Lax + Secure + 第一方域，基本不受影響；第三方 conversion pixel 會受影響但不關我們的 DB 事 |
| 手機瀏覽器分享連結（沒 UTM）| server_referrer 補記 |
| 使用者跨裝置（手機看 ad、電腦付款）| 歸因會斷。業界共識：接受。GA4 User-ID 可在登入場景連起來，但 R-01 不登入 |

---

## 6. 補到現有 `src/lib/gtm.ts` 的新 helper

```ts
export function trackDiagnosticPurchase(opts: {
  order_no: string;
  value: number;
  currency?: string;
}) {
  pushEvent('purchase', {
    transaction_id: opts.order_no,
    value: opts.value,
    currency: opts.currency ?? 'TWD',
    items: [{
      item_id: 'diagnostic',
      item_name: 'adlo 在地品牌診斷報告',
      price: opts.value,
      quantity: 1,
    }],
  });
}

export function trackDiagnosticRefund(opts: { order_no: string; value: number }) {
  pushEvent('refund', {
    transaction_id: opts.order_no,
    value: opts.value,
    currency: 'TWD',
  });
}

export function trackDiagnosticEvent(name: string, params: Record<string, unknown> = {}) {
  pushEvent(`diagnostic_${name}`, params);
}
```

---

## 7. 隱私 / PDPA

- Cookie 設置 banner（adlo.tw 現況需確認有無 cookie consent）→ 若要上 GDPR 等級，需在 consent 前**不寫** cookie
- `source_utm` 不存 email 明文（存 hash）
- IP 寫入 DB 前做 sha256 截 16 字
- 隱私權政策需增加「我們會記錄您來自哪個廣告以分析成效」一段

---

## 8. 驗收查詢（上線後）

```sql
-- 最受歡迎的 UTM source（轉單率）
SELECT
  source_utm->>'source' AS src,
  COUNT(*) AS orders,
  SUM(CASE WHEN status IN ('paid','report_sent','upgraded') THEN 1 ELSE 0 END) AS paid_orders,
  SUM(CASE WHEN status = 'upgraded' THEN 1 ELSE 0 END) AS upgrades
FROM diagnostic_orders
WHERE created_at > now() - interval '30 days'
GROUP BY src
ORDER BY orders DESC;

-- 客戶流失分析：從 landing 到付款的來源
SELECT
  source_utm->>'landing_path' AS landing,
  COUNT(*) AS total
FROM diagnostic_orders
GROUP BY landing
ORDER BY total DESC;
```

---

## 9. 開發人天估算

| 區塊 | 人天 |
|---|---|
| `UtmCapture.tsx` + 整合到 layout | 0.5 |
| `src/lib/gtm.ts` 新 helpers | 0.25 |
| checkout route 解析 + server fallback | 0.25 |
| GTM 7 個 trigger + tag（Ada 主導） | 1（歸 Ada） |
| 隱私權政策文字更新（Ada / Lorenzo） | 0.25 |
| 驗收查詢 + 初始儀表板 | 0.5 |
| **Kael 責任小計** | **~1.5 天** |

## 10. 前置依賴
- GTM 有 editor 權限（已具備）
- DB schema 02 已 apply
- 隱私權政策可更新（法務）

> → GTM trigger 設定、GA4 event 建立屬於 **Ada** 領域。
> → 本文件 §8 驗收查詢的 SQL 執行 可交由 **Haiku**。
