export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: number; // minutes
  content: string; // HTML
}

export const posts: Post[] = [
  {
    slug: 'geo-impact-on-small-business-2026',
    title: 'GEO 如何對中小型網站帶來毀滅性打擊？2026 年你該怎麼做',
    description: 'AI 搜尋引擎（ChatGPT、Gemini、Perplexity）正在吃掉你的自然流量。數據顯示部分網站流量暴跌 60%。這篇文章告訴你 GEO 是什麼，以及台灣中小企業該如何反制。',
    publishedAt: '2026-04-05',
    category: 'SEO 趨勢',
    tags: ['GEO', '生成式引擎優化', 'AI搜尋', 'Local SEO', '台灣SEO', '中小企業'],
    author: 'adlo 編輯部',
    readingTime: 8,
    content: `
<p class="lead">你上個月的 Google Search Console 流量是不是開始悄悄下滑？你以為是演算法更新，但這次不一樣——這次是 <strong>結構性的</strong>。</p>

<p>AI 搜尋引擎正在重寫遊戲規則。ChatGPT Search、Google AI Overviews、Perplexity AI⋯⋯這些工具正在替代傳統搜尋，而你的網站可能正在被「跳過」。</p>

<h2>什麼是 GEO？</h2>

<p><strong>GEO（Generative Engine Optimization，生成式引擎優化）</strong>是 2024 年底開始被廣泛討論的新概念，指的是針對 AI 生成式搜尋引擎優化內容的策略——讓你的網站成為 AI 回答問題時的「引用來源」。</p>

<p>傳統 SEO 的目標是讓你的連結出現在搜尋結果第一頁。GEO 的目標是讓 AI 在回答問題時，直接引用你的內容，甚至把你的品牌說出來。</p>

<p>如果 AI 沒有引用你，對使用者來說，你的網站等於不存在。</p>

<h2>2026 年的數據有多嚇人？</h2>

<p>根據 Gartner 預測，到 2026 年，傳統搜尋引擎流量將下降 <strong>25%</strong>。部分利基市場（法律、醫療、理財）的跌幅甚至超過 <strong>60%</strong>。</p>

<p>在台灣，Google AI Overviews 已開始逐步推出。當使用者搜尋「台北診所推薦」或「信義區最好的咖啡廳」，AI 直接給出整合回答——使用者根本不需要點進任何網站。</p>

<blockquote>
  <p>「Zero-click searches」（零點擊搜尋）在 2025 年已佔所有搜尋的 <strong>64%</strong>。2026 年這個數字只會更高。</p>
</blockquote>

<h2>中小型網站的三大死穴</h2>

<h3>1. 內容太薄，AI 不引用</h3>
<p>AI 只引用它認為「可信、具體、有深度」的來源。如果你的網站只有 5 頁產品介紹，文字稀少、沒有專業觀點，AI 在建構回答時會直接略過你，改用內容更豐富的競爭對手或媒體網站。</p>

<h3>2. 沒有結構化資料，AI 看不懂你是誰</h3>
<p>Schema.org 的 JSON-LD 標記讓 AI 理解你的商家類型、地點、服務項目和評價。沒有結構化資料，AI 需要「猜」你在做什麼——而它的猜測結果通常對你不利。</p>

<h3>3. 在地信號不夠強</h3>
<p>當有人問 AI「台中最好的水電工」，AI 會綜合 Google 商家評論、在地媒體報導、論壇討論來做回答。如果你的商家在這些地方幾乎沒有存在感，AI 根本不會提到你。</p>

<h2>在地 SEO 的逆勢機會</h2>

<p>壞消息說完了，現在說一個好消息：<strong>在地 SEO 是目前最能抵抗 GEO 衝擊的策略</strong>。</p>

<p>原因很簡單——當使用者搜尋「附近的診所」或「台北信義區美髮」，AI 知道自己無法確認「使用者現在在哪裡」，因此它仍然傾向把帶有地理資訊的搜尋導回 Google 地圖和在地搜尋結果。</p>

<p>換句話說，<strong>在地化搜尋是 AI 最難完全取代的部分</strong>。你的競爭對手在做國際 SEO、部落格流量——那些正在被 AI 蠶食。但如果你的策略是「讓附近的客人找到你」，這個需求 AI 還是要靠你的 GBP（Google 商家檔案）和在地評論來回答。</p>

<h2>2026 年你應該立刻做的 5 件事</h2>

<h3>① 強化你的 Google 商家檔案（GBP）</h3>
<p>這是 AI 在地搜尋最重要的信號來源。確保你的商家資訊完整、類別正確、每週有新貼文、評論持續累積。這不只是給 Google 看的，也是給 AI 看的。</p>

<h3>② 在你的網站加入 Schema JSON-LD</h3>
<p>最少要有：<code>LocalBusiness</code>、<code>FAQPage</code>（常見問題）、<code>Review</code>（評論）。這些結構化資料讓 AI 理解你的商家定位，大幅提升被引用的機率。</p>

<h3>③ 建立「答案型」內容</h3>
<p>AI 偏好引用能直接回答問題的內容。例如：「台北哪個區的診所評價最好？」、「在地 SEO 多久才有效？」——把你的常見問題寫成完整文章，格式清晰、有具體數據、有明確結論。</p>

<h3>④ 累積在地媒體引用</h3>
<p>讓在地新聞網站、社群論壇（PTT、Dcard）提到你的商家名稱和地址。這些「非 Google」的在地信號正在成為 AI 評估商家可信度的重要依據。</p>

<h3>⑤ 監控你的「AI 能見度」</h3>
<p>除了 Search Console，現在你也要開始測試：在 ChatGPT、Gemini、Perplexity 搜尋你的商家類別 + 城市，看看 AI 推薦的是誰。如果沒有你，就是你的下一個行動清單。</p>

<h2>結語：不是末日，是換賽道</h2>

<p>GEO 不是在地行銷的終結——它是一次洗牌。那些只靠薄弱內容和過時 SEO 技巧的網站會消失，但那些認真做在地化、建立真實口碑、提供具體價值的商家，反而會在 AI 時代取得更大的競爭優勢。</p>

<p>因為 AI 需要可靠的在地資訊來源——而你可以成為那個來源。</p>

<div class="cta-box">
  <p>你的網站目前的 AI 能見度如何？讓 adlo 幫你做一份完整的在地 SEO + GEO 體檢，找出你的機會缺口。</p>
</div>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
