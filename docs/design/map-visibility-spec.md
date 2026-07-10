# 新工具技術規格：Google 地圖曝光優化清單產生器

> 作者：Kael（DEV-01）｜2026-06-25｜狀態：**待 Lorenzo 核准概念後開工**
> 觸發需求：Lorenzo「新工具：如何做好你的 Google Map 顯示」＋ 選定「互動工具（如現有 9 支）」

---

## 1. 定位（為什麼它不是 /check）

| | `/check`（GBP 健診） | **本工具（Map Visibility Planner）** |
|---|---|---|
| 角色 | 診斷：現況打幾分 | **處方：接下來該做哪些事、依序怎麼做** |
| 輸入 | 店名 | 業態 + 地區 + 現況勾選 |
| 輸出 | 分數 + 弱項 | **依優先序（P0/P1/P2）的行動清單** |

符合 adlo 定位「結構化工具，不是 AI 聊天」。健診找出問題，本工具給可執行的下一步，並把每個行動 **cross-link 到對應的既有工具**（發文→貼文產生器、評論→評論連結…），形成工具箱內部導流。

---

## 2. 路由與資料合約

- Route：`/tools/map-visibility`（已確認不與 competitor/keyword/line-broadcast/name/post-writer/prompt/review-link/seo-scorer 衝突）
- 純前端規則引擎，**無付費 API、無外部呼叫**（成本 0，符合 Guardrail 費用層級）

### Input（表單 → 規則引擎）
```jsonc
{
  "industry": "string",        // 用新分組選單（含「裝潢修繕」4 子項）
  "city": "string",            // 地區，影響在地關鍵字建議文案
  "keyword": "string?",        // 選填，主要關鍵字
  "status": {                  // 現況自評（決定缺口）
    "hasGbp": "boolean",
    "photoCount": "none|few|some|many",   // 0 / 1-5 / 6-20 / 20+
    "postedLast30d": "boolean",
    "reviewCount": "none|low|mid|high",   // 0 / 1-20 / 21-100 / 100+
    "repliesReviews": "boolean",
    "napConsistent": "boolean",
    "hoursFilled": "boolean",
    "categorySet": "boolean"
  }
}
```

### Output（規則引擎 → Results 元件）
```jsonc
{
  "priorityActions": [
    {
      "id": "string",
      "priority": "P0|P1|P2",
      "title": "string",
      "why": "string",          // 為什麼影響地圖排名（GBP 最佳實務）
      "effortMin": "number",    // 預估工時（分鐘）
      "toolHref": "string?",    // 可代勞的 adlo 工具連結
      "toolName": "string?"
    }
  ],
  "thisWeekTop3": ["id", "id", "id"]   // 摘要：本週先做這 3 件
}
```

> 合約以 JSON Schema 落地於 `src/lib/map-visibility.ts`，依 §7.1 / agentic-workflow-design：節點無狀態、上下游用 JSON。

---

## 3. 規則引擎（deterministic，Kael 主責）

每個 `status` 缺口對應一條行動，優先序規則：
- **P0**：無 GBP / NAP 不一致 / 無類別（地圖根本進不來）
- **P1**：照片 none-few / 近 30 天未發文 / 評論 none-low（排名訊號弱）
- **P2**：未回覆評論 / 營業時間未填 / 進階優化

排序：P0 → P1 → P2，同級依「對排名影響權重」降冪。`thisWeekTop3` 取前 3。

> 行動清單文字屬 **GBP 事實性最佳實務**，由 Kael 起草規則庫；**行銷語氣與在地化範例由 Ada 潤飾**（見 `map-visibility-brief.md`）。

---

## 4. 檔案計畫（沿用 post-writer 結構）

| 檔案 | 內容 | 主責 |
|---|---|---|
| `src/app/tools/map-visibility/page.tsx` | 頁面殼 + metadata + JSON-LD（SoftwareApplication/HowTo） | Kael |
| `src/components/map-visibility/MapVisibilityHero.tsx` | 表單（業態分組選單 + 現況勾選） | Dior 版型 / Kael 接 |
| `src/components/map-visibility/MapVisibilityResults.tsx` | 優先序行動清單 + 本週 Top3 | Dior / Kael |
| `src/components/map-visibility/MapVisibilityFlow.tsx` | 3 步驟說明 | Dior |
| `src/components/map-visibility/MapVisibilityFAQ.tsx` | FAQ accordion + FAQ schema | Kael |
| `src/lib/map-visibility.ts` | 型別 + 規則引擎 + 行動規則庫 | Kael |
| `src/app/tools/page.tsx` | 新增工具卡（status: live） | Kael |
| `src/app/page.tsx` | 首頁 grid 第 10 張卡 + 計數 9→10（Hero/HeroTryWidget 同步） | Kael |

---

## 5. 跨角色相依與下一步

1. **Lorenzo**：核准本概念（診斷→處方的行動清單工具）。← **目前卡這**
2. **Dior**：Hero/Results/Flow 三視圖版型（套 design rules v2.0、淺綠 Hero）。
3. **Ada**：行動清單語氣潤飾 + 在地化範例（brief 見同目錄 `map-visibility-brief.md`）。
4. **Kael**：規則引擎 + 串接 + JSON-LD + /tools 與首頁掛卡。

預估：規則引擎 + 頁面 ~1.5 天（Dior/Ada 內容就緒後）。建議走 `adlo-orchestrator` 統籌三方。

> 本工具會讓首頁工具數來到 **10 支**，屆時一併更新所有「9 支免費工具」文案。
