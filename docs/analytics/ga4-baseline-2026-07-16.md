---
author: Kael（GA4 Data API 撈取）+ Ada（解讀）
date: 2026-07-16
status: baseline — 流量計畫 KPI 校準依據
---

# GA4 30 天基線報告（2026-06-16 → 07-16）

資源：adlo.tw（`533600192`）。透過服務帳戶 + GA4 Data API 撈取。

## 總量

| 指標 | 30 天值 |
|------|--------|
| 使用者 | ~100（first_visit 94） |
| Sessions | ~119 |
| 瀏覽量 | 160 |
| 日均使用者 | 1–7（例外：7/8 尖峰 27 人，原因待查） |

## 流量來源

| 管道 | Sessions | 使用者 |
|------|----------|--------|
| Direct | 97 | 83 |
| **Organic Search** | **15** | **10** |
| Unassigned | 6 | 3 |
| AI Assistant | 1 | 1 |

→ **自然搜尋 15 sessions/月就是基線**。Direct 佔比 82% 代表流量幾乎全靠既有認知，SEO 引擎尚未啟動（三篇貼文 cluster 剛上線，未發酵）。

## Top 頁面

| 頁面 | 瀏覽 | 使用者 |
|------|------|--------|
| / | 39 | 21 |
| /blog/dan-koe-insights-taiwan-2026 | 19 | 19 |
| /blog/dan-koe-narrow-content-strategy-2026 | 15 | 16 |
| /tools | 14 | 2 |
| /blog | 8 | 2 |

→ **Dan Koe 內容線是全站最強**（兩篇合計 35 個獨立使用者）；**12 支工具頁接近零真實流量**（/tools 的 2 個使用者疑為內部）。

## 事件

只有 GA4 內建事件（page_view 160、scroll 63、form_start 2）。**10 個自訂 dataLayer 事件全部為 0——GTM 容器尚未發布**（Lorenzo 待辦）。

## 結論 → 行動

1. SEO 引擎：完成貼文 cluster 第三篇（優先 3），之後每支工具配問題文
2. 黏著引擎：工具零流量前提下，先靠內容帶人 → 結果頁推 /my-week 留人 → 分享卡擴散
3. 量測：GTM 容器發布後轉換事件才有數據；建議綁 GSC 補搜尋端
4. 下次撈數：8/16（30 天後）對照本基線
