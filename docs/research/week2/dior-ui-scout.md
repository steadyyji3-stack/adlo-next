---
author: Dior
date: 2026-04-24
status: delivered
---

# Task B — AI 寫作工具 UI Scout（Post Writer 設計參考）

> **資料來源說明：** 本報告所列三個網站（copy.ai、jasper.ai、notion.so/product/ai）在爬取期間全部回傳 HTTP 403，無法直接擷取頁面原始碼。以下分析綜合自：官方 PR 稿、品牌指南頁（jasper.ai/brand）、G2／Capterra 評論、Figma Community 的 Jasper Landing Page 檔案、Mobbin 品牌色盤資料、SaaSFrame UI 截圖記錄、以及多篇 2025–2026 年深度評測文章。標記「估算」之處表示無法從抓取資料直接核實，係依據業界公認資料推斷。

---

## 各工具結構摘要

### 1. Copy.ai

Copy.ai 在 2024–2025 年間完成品牌重定位，將自身定義為「GTM AI 平台」而非單純的文案生成工具。首頁 Hero 標題為 **"Future proof your business with GTM AI"**，副標強調以單一平台取代多個零散工具。頁面採淺色系設計，以白底搭配紫色（品牌主色）作為 CTA 按鈕色。社會證明集中在 Hero 下方，展示 Nestlé、Samsung、Unilever、Microsoft、eBay、Ogilvy 等 Logo 牆，並引用「數千萬用戶」規模數據。產品工具頁（/tools）以卡片矩陣呈現 100+ 工具，分類導航清晰；社群媒體貼文生成器有簡易的多欄位表單，含「主題」「語調」「平台」等欄位。整體走向企業級（enterprise-first）定位，從個人創作者工具轉型為 B2B 銷售／行銷自動化平台。

### 2. Jasper.ai

Jasper 於 2025 年中進行大規模品牌重塑與產品升級，推出「Agentic Era」定位，主打 **"Put AI agents to work for marketing"**。同步發布 Jasper Agents（100+ 專屬行銷 AI 代理人）與 Jasper Canvas（協作工作區）。視覺識別大幅更新：棄用舊有藍紫色，改採 Hot Pink（熱粉）＋ Electric Violet（電紫）＋ Cyan 三色系組合，整體風格鮮豔大膽。首頁 Hero 包含動態 Demo 演示區塊，以動圖展示 Canvas 工作流程。CTA 以「Start for free」為主，並搭配「Watch Demo」次要按鈕。社會證明引用「接近 Fortune 500 中 20% 企業使用」以及 Adidas、Prudential、Wayfair 等品牌案例，G2 評分 4.7–4.9 星（依版本）。模板頁以卡片網格展示，每張卡片可預覽輸出樣式。

### 3. Notion AI

Notion AI 的產品頁標題為 **"Meet your AI team"**，副標語為 **"Search. Generate. Analyze. Chat — right inside Notion."**。頁面繼承 Notion 一貫的極簡白底風格，以黑色主文、#E3E2DE 淺灰底色作為次要區塊背景，品牌色在行動呼籲元素上偶爾出現橘色／琥珀色點綴（估算）。Notion AI 深度整合在既有工作區內，因此產品頁不提供獨立的輸入表單，而以動態截圖與功能說明卡片展示整合體驗。主 CTA 為「Try Notion AI」，次要 CTA 連結至定價頁。社會證明採輪播（Carousel）形式，整合用戶 quote 與品牌 Logo，位置在功能介紹區塊後段。字體使用自訂版 Inter（Notion Inter），字重偏重、行距寬鬆，閱讀感舒適。

---

## 7 維度比較表

| 維度 | Copy.ai | Jasper.ai | Notion AI |
|---|---|---|---|
| **1. Hero 結構** | 單句強烈 Headline + 短副標；Hero 區無動圖，以靜態 UI 截圖作為視覺支撐；訴求企業決策者 | 多句 Headline 搭配動態 Demo 動圖（Canvas 工作流程動畫）；Hero 下方有 "Watch Demo" 次要連結；視覺衝擊感強 | 單句詩意 Headline + 四字節奏副標（Search. Generate. Analyze. Chat.）；無 Hero 動圖，以靜態截圖展示；氣氛沉穩 |
| **2. 輸入介面** | 工具頁採「多欄位表單」：主題、產業、語調、輸出長度等欄位；提供 Example 填入提示（估算）；企業版有「已儲存品牌資料」自動帶入功能 | 模板頁每個模板有獨立表單：品牌語調、關鍵字、目標受眾、語言等欄位；提供佔位文字引導（placeholder）；Canvas 支援自由輸入＋斜線指令觸發 | 非獨立工具頁，介面呈現整合在 Notion 工作區內；輸入以自然語言 Prompt 為主；無傳統表單欄位；AI 側邊欄浮動顯示 |
| **3. 輸出呈現** | 工具頁以「卡片矩陣」列示工具；生成後以清單形式呈現 3–5 個變體供選擇（估算）；支援在線編輯（inline edit） | 輸出呈現在 Canvas 工作區，支援即時預覽與協作編輯；模板頁卡片可點擊預覽輸出範例；有「複製」「重生成」快速操作按鈕 | 輸出直接嵌入 Notion 文件頁面（inline）；無獨立輸出預覽區；支援一鍵「Replace / Insert below / Continue」選項；整合感最高 |
| **4. CTA 位置與文案** | 主 CTA：Hero 區「Get Started for Free」；導覽列有「Try Free」次要入口；工具頁每工具卡片各有「Use Template」；估計全頁 3–4 個 CTA 點 | 主 CTA：Hero 區「Start for free」＋次要「Watch demo」；定價頁「Start your 7-day free trial」；模板頁每張卡片有試用 CTA；文案聚焦「免費試用降低門檻」；全頁約 4–5 個 CTA 點 | 主 CTA：Hero 區「Try Notion AI」；次要 CTA 連結至定價；頁面中段有「Add to workspace」；全頁約 2–3 個 CTA；文案著重「整合」而非「免費」 |
| **5. 社會證明** | 位置：Hero 緊接下方 Logo 牆（Nestlé、Samsung、Microsoft 等）；中段有用戶 Quote；數字型社會證明（「數千萬用戶」）置於 Hero 區附近；形式：Logo 牆＋數字＋Quote | 位置：Hero 區下方品牌 Logo（Adidas、Prudential、Wayfair 等）；中段「Fortune 500 中近 20% 採用」數字；後段客戶 Quote 與案例；G2／Capterra 星評標示在早期滾動段；形式：Logo 牆＋數字＋星評＋Quote | 位置：功能介紹區後段輪播（Carousel）；早段無 Logo 牆（依賴品牌知名度）；數字型社會證明較少；形式：用戶 Quote 輪播＋部分媒體提及 Logo；整體社會證明密度最低，氣質走「不需多說」路線 |
| **6. 配色 & 字體** | 主色：深紫（#6A27F4 附近，估算）；輔色：白底＋淺灰；CTA 按鈕為品牌紫；字體：現代無襯線體（Geist 或 Inter 系，估算）；整體感：科技感中性，企業可信 | 主色：Hot Pink（#FF2D78 附近）＋ Electric Violet（#7B2FF7 附近）＋ Cyan；深色背景 Hero 搭配彩色漸層；字體：現代粗體無襯線（定製字型）；整體感：大膽活潑、創意感強、視覺衝擊高 | 主色：黑（#000000）＋白（#FFFFFF）＋淺暖灰（#E3E2DE）；點綴色：橘／琥珀色（估算）；字體：Notion Inter（定製版 Inter）；字重偏重、行距舒適；整體感：極簡、溫暖中性、無壓迫感 |
| **7. adlo Post Writer 借鏡 vs 不借鏡** | 見下方詳述 | 見下方詳述 | 見下方詳述 |

---

## adlo Post Writer 設計建議

### 可借鏡 3 點

**1. Copy.ai：Hero 緊接 Logo 牆的社會證明配置**

Copy.ai 在 Hero 區與功能說明區之間插入品牌客戶 Logo 牆，以無聲方式建立可信度，不佔用主視覺空間。adlo Post Writer 可在淺綠 Hero（#E1F5EE）下方緊接排列台灣知名品牌的使用 Logo，或以「已服務 XXX 家在地商家」數字條呈現，符合台灣 B2B 用戶看重口碑的文化心理。此做法不影響白底／淺色系主題，完全相容 adlo 品牌規範。

**2. Jasper.ai：每個模板卡片附帶輸出預覽的卡片設計**

Jasper 模板頁讓每張卡片在 hover 或點擊時可預覽生成樣本，大幅降低用戶對「不知道會產出什麼」的焦慮。adlo Post Writer 若提供「最新動態」「優惠活動」「QA 問答」「幕後故事」等不同貼文風格卡片，每張附一段繁中示範文字（以主綠 #1D9E75 底色高亮顯示），用戶在選擇風格前即建立期待，轉換率更高，且視覺上維持輕盈感。

**3. Notion AI：單句詩意 Headline 搭配四字節奏副標的文案結構**

Notion AI 的副標以短句節奏強化記憶，不需要長篇解釋功能。adlo Post Writer 可採用類似結構：Hero 主標一句話（如「一鍵完稿，替你說出在地故事」），副標以繁中四字詞組節奏（「輸入主題。選擇語調。預覽貼文。立即發布。」）呼應，在淺綠 Hero 背景上以主綠字色點綴核心動詞，清楚而不複雜。

### 不借鏡 3 點

**1. Jasper.ai：深色 Hero 背景搭配高飽和漸層配色**

Jasper 的 Hot Pink ＋ Electric Violet ＋深色背景雖視覺衝擊強，但與 adlo 品牌鐵律「非 dark mode、淺綠 Hero #E1F5EE」直接衝突。強飽和漸層在繁中介面中也容易讓文字對比度下降，不利閱讀。adlo 的在地商家客群（餐廳、零售、服務業）對過度前衛的視覺有疏離感，品牌親切感是 adlo 的核心差異，深色系會削弱這個優勢。

**2. Copy.ai：企業級多欄位重型表單**

Copy.ai 工具頁的表單包含品牌資料庫、多層級選項、產業分類等設定，設計導向大型企業工作流。adlo Post Writer 的主要用戶是台灣中小型商家老闆或單人行銷人員，過多欄位會形成填寫疲勞（form fatigue），直接降低完成率。adlo 應守住「3 個核心輸入欄位以內」的簡潔原則（店名／主題、活動目的、語調）搭配智慧預設值，讓用戶感受到「比自己想得還容易」的輕盈感。

**3. Notion AI：整合式介面、無獨立輸出預覽區**

Notion AI 的輸出直接嵌入文件，適合已深度使用 Notion 工作區的用戶，但對於初次接觸 AI 寫作工具的台灣中小企業主而言，缺乏明確的「輸入→生成→確認」三步驟視覺流程，會產生不知道「AI 在做什麼」的困惑感。adlo Post Writer 必須提供清楚的輸出預覽區塊（以白色卡片＋主綠邊框區隔），讓生成結果在頁面上有一個明確的「落點」，符合繁中介面用戶對清晰操作回饋的期待。

---

## 結論

三款工具各自代表 AI 寫作工具設計的三種策略：Copy.ai 以企業 GTM 平台定位走重功能、重社會證明路線；Jasper 以大膽視覺與 Agent 敘事搶佔心佔率；Notion AI 則以無縫整合降低摩擦。adlo Post Writer 的設計甜蜜點應介於 Copy.ai 的「清晰三步驟表單」與 Notion 的「輕盈單句文案」之間，以繁中在地語境、淺綠品牌溫度、和台灣中小商家可立即上手的低門檻體驗作為最大差異化。借鏡三點皆可在 #E1F5EE／#1D9E75 色系下直接實作，不需進行任何品牌色調妥協。
