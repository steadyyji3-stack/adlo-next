export interface PostImage {
  url: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: number;
  coverImage: PostImage;
  content: string;
}

export const posts: Post[] = [
  {
    slug: 'dan-koe-insights-taiwan-2026',
    title: 'Dan Koe 最強心法精選翻譯：2026 年一人事業與內容創作的底層邏輯',
    description: '擁有 260 萬追蹤者、年收入超過 400 萬美元的 Dan Koe，用最少的話說最重要的事。本篇精選他 8 篇核心發文，附中文翻譯與台灣在地行銷視角的深度解析。',
    publishedAt: '2026-04-05',
    category: '創作者洞見',
    tags: ['Dan Koe', '一人事業', '內容行銷', '個人品牌', '寫作', '商業思維'],
    author: 'adlo 編輯部',
    readingTime: 10,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
      alt: '一個人在咖啡廳寫作，筆記本與咖啡',
      credit: 'Andrew Neel',
      creditUrl: 'https://unsplash.com/@andrewneel',
    },
    content: `
<p class="lead">如果你花 5 分鐘滑過他的 X（Twitter）主頁，你會發現一件事：Dan Koe 從不廢話。</p>

<p>260 萬追蹤者、年收入超過 400 萬美元、每天只工作 2–4 小時——這些數字讓很多人好奇：他到底說了什麼？</p>

<p>這篇文章精選他 8 篇最有代表性的發文，逐一翻譯並加上我們針對<strong>台灣中小企業主與在地行銷</strong>的深度解析。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&auto=format&fit=crop&q=80" alt="筆記本上的手寫文字，創作思考" loading="lazy" />
  <figcaption>寫作是思考的外殼。Dan Koe 的商業模式建立在「先想清楚，再寫出來」的基礎上。Photo by <a href="https://unsplash.com/@glenncarstenspeters" target="_blank" rel="noopener">Glenn Carstens-Peters</a> on Unsplash</figcaption>
</figure>

<h2>① 最低風險、最高回報的商業模式</h2>

<blockquote>
  <p>"Post ideas on social media → Analyze which do the best → Turn them into free downloads → Turn one into a digital product → Improve until irresistible. Free idea validation, cash flow to do it full time. When combined with AI, it's the lowest risk highest reward option."</p>
  <footer>— Dan Koe, 2025</footer>
</blockquote>

<p><strong>中文翻譯：</strong>在社群媒體上發想法 → 分析哪個最受歡迎 → 做成免費下載 → 選一個做成付費產品 → 不斷優化到無法拒絕。免費驗證想法、用現金流轉職全職。結合 AI，這是風險最低、回報最高的選項。</p>

<p><strong>adlo 解析：</strong>這個框架對台灣在地服務業同樣適用。你的 Google 商家貼文就是「在社群發想法」——哪篇貼文獲得最多互動？那就是你最強的行銷切入點。你不需要先投廣告費，先用有機內容測試，再決定要加速哪個方向。</p>

<h2>② 寫作就是思考的外殼</h2>

<blockquote>
  <p>"Writing helps you think. Thinking helps you get what you want."</p>
  <footer>— Dan Koe</footer>
</blockquote>

<p><strong>中文翻譯：</strong>寫作幫助你思考。思考幫助你得到你想要的。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&auto=format&fit=crop&q=80" alt="人在電腦前思考寫作" loading="lazy" />
  <figcaption>把你解決過的問題寫下來，就是你最好的行銷素材。Photo by <a href="https://unsplash.com/@austindistel" target="_blank" rel="noopener">Austin Distel</a> on Unsplash</figcaption>
</figure>

<p><strong>adlo 解析：</strong>很多台灣老闆覺得自己不會寫文章，但其實你每天都在解決問題。把你如何解決客戶問題的過程寫下來——那就是你最強的 SEO 內容，也是最真實的社群素材。你不需要文采，你需要的是誠實。</p>

<h2>③ 痛苦才是改變的燃料</h2>

<blockquote>
  <p>"Most people don't change until the pain is so great that they only have two choices: drown or launch."</p>
  <footer>— Dan Koe, Nov 2024</footer>
</blockquote>

<p><strong>中文翻譯：</strong>大多數人在痛苦大到只剩兩個選擇之前不會改變：沉下去，或者起飛。</p>

<p><strong>adlo 解析：</strong>這句話可以直接用在你的行銷文案上。你的客戶為什麼找你？因為現狀已經痛苦到無法忍受。在你的聯絡頁面、廣告文案中，先說出他的痛點，再說你的解法——這是轉換率最高的結構。</p>

<h2>④ 你解決過的問題就是你的事業</h2>

<blockquote>
  <p>"If you've solved a problem in your life, you're qualified to start a business. An education business. As one person. With close-to-zero startup costs."</p>
  <footer>— Dan Koe</footer>
</blockquote>

<p><strong>中文翻譯：</strong>如果你解決過生命中的某個問題，你就有資格開始一門生意。一個教育型事業。一個人。幾乎零啟動成本。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=80" alt="小型團隊開會討論策略" loading="lazy" />
  <figcaption>你不需要等到「準備好」才開始。你已經解決的問題，就是最好的起點。Photo by <a href="https://unsplash.com/@jasongoodman_youxventures" target="_blank" rel="noopener">Jason Goodman</a> on Unsplash</figcaption>
</figure>

<p><strong>adlo 解析：</strong>這對 adlo 的客戶很直接——你開了一家店，你每天都在解決「如何讓更多客人找到我」的問題。你的 10 年經驗就是別人無法複製的護城河。把這個過程說出來，就是你最好的差異化定位。</p>

<h2>⑤ 無聊的基本功才是護城河</h2>

<blockquote>
  <p>"How to outperform 99% of people: 1) Repeat the boring fundamentals. 2) Let everyone else drown in tactics."</p>
  <footer>— Dan Koe</footer>
</blockquote>

<p><strong>中文翻譯：</strong>如何超越 99% 的人：1）重複枯燥的基本功。2）讓其他人淹死在戰術裡。</p>

<p><strong>adlo 解析：</strong>在地 SEO 就是這句話的完美體現。每週發 Google 商家貼文、持續回覆評論、每月更新商家資訊——這些「無聊」的動作，6 個月後就是你的競爭對手看不到的排名優勢。他們在追最新的廣告格式，你在鞏固地基。</p>

<h2>⑥ 先創作，再消費</h2>

<blockquote>
  <p>"When you create before you consume, you stay grounded."</p>
  <footer>— Dan Koe</footer>
</blockquote>

<p><strong>中文翻譯：</strong>當你在消費之前先創作，你就能保持清醒。</p>

<p><strong>adlo 解析：</strong>每天早上第一件事不是滑社群，而是寫一則貼文、回覆一條評論、更新一筆商家資訊。這個順序決定你是主動塑造品牌，還是被動跟著別人跑。對在地行銷而言，創作優先意味著持續產出本地化內容，而不是等靈感來了才發。</p>

<h2>⑦ 沒有人會來救你</h2>

<blockquote>
  <p>"Nobody is coming to save you. Not your parents. Not your best friend. Not the government. Not your favorite book. They can offer a helping hand, but the choice to improve is yours and yours alone."</p>
  <footer>— Dan Koe</footer>
</blockquote>

<p><strong>中文翻譯：</strong>沒有人會來救你。不是你的父母、最好的朋友、政府，也不是你最喜歡的書。他們可以伸出援手，但選擇進步是你一個人的事。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80" alt="獨自在書桌前學習工作的人" loading="lazy" />
  <figcaption>改變永遠從自己開始。等待時機不如創造時機。Photo by <a href="https://unsplash.com/@craftedbygc" target="_blank" rel="noopener">Green Chameleon</a> on Unsplash</figcaption>
</figure>

<p><strong>adlo 解析：</strong>這句話對台灣老闆很有共鳴——你的競爭對手不會等你準備好。平台不會優先推薦你，客人不會主動找你說明。唯一能讓你脫穎而出的，是你現在就開始優化你的在地存在感，而不是等到生意不好才動。</p>

<h2>⑧ 150 億次觀看背後的核心策略</h2>

<p>2026 年 1 月，Dan Koe 一篇文章在 X 上創下<strong>單週 1.5 億次觀看</strong>的紀錄，14 天靠 X 分潤獲得 4,495 美元——但他說這不是重點，後端產品才是。</p>

<blockquote>
  <p>"Information is labor. AI is only effective when it has sufficient context."</p>
  <footer>— Dan Koe, 2026 Newsletter</footer>
</blockquote>

<p><strong>中文翻譯：</strong>資訊是勞動力。AI 只有在擁有足夠背景資訊時才有效。</p>

<p><strong>adlo 解析：</strong>這對在地 SEO 非常關鍵。你給 Google 的資訊越完整（商家描述、照片、貼文、評論回覆），Google 和 AI 就越能精確地把你推薦給對的客人。你的 Google 商家檔案，就是你給 AI 的「context（背景資訊）」。</p>

<h2>總結：Dan Koe 給台灣老闆的三個啟示</h2>

<p>把他的思維框架套用在你的在地行銷上：</p>

<ol>
  <li><strong>你的日常就是你的內容。</strong>解決過的問題、服務過的客戶、克服過的挑戰——都是你最真實、最有說服力的行銷素材。</li>
  <li><strong>重複基本功，別追戰術。</strong>持續經營 Google 商家、定期發貼文、認真回覆評論——6 個月的複利效應，勝過任何短期爆量技巧。</li>
  <li><strong>現在就開始，不等完美。</strong>你的商家不需要完美的網站才能做 SEO，不需要大預算才能做廣告。今天就能做的事，不要等到明天。</li>
</ol>

<div class="cta-box">
  <p>想知道你的在地競爭對手現在在做什麼？adlo 提供免費在地 SEO 競爭分析，讓你知道從哪裡開始最有效。</p>
</div>
    `.trim(),
  },
  {
    slug: 'geo-impact-on-small-business-2026',
    title: 'GEO 如何對中小型網站帶來毀滅性打擊？2026 年你又該怎麼做',
    description: 'AI 搜尋引擎（ChatGPT、Gemini、Perplexity）正在吃掉你的自然流量。數據顯示部分網站流量暴跌 60%。這篇文章告訴你 GEO 是什麼，以及台灣中小企業該如何反制。',
    publishedAt: '2026-04-05',
    category: 'SEO 趨勢',
    tags: ['GEO', '生成式引擎優化', 'AI搜尋', 'Local SEO', '台灣SEO', '中小企業'],
    author: 'adlo 編輯部',
    readingTime: 8,
    coverImage: {
      url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
      alt: 'AI 生成式搜尋引擎視覺化概念圖',
      credit: 'Google DeepMind',
      creditUrl: 'https://unsplash.com/@googledeepmind',
    },
    content: `
<p class="lead">你上個月的 Google Search Console 流量是不是開始悄悄下滑？你以為是演算法更新，但這次不一樣——這次是 <strong>結構性的</strong>。</p>

<p>AI 搜尋引擎正在重寫遊戲規則。ChatGPT Search、Google AI Overviews、Perplexity AI⋯⋯這些工具正在替代傳統搜尋，而你的網站可能正在被「跳過」。</p>

<h2>什麼是 GEO？</h2>

<p><strong>GEO（Generative Engine Optimization，生成式引擎優化）</strong>是 2024 年底開始被廣泛討論的新概念，指的是針對 AI 生成式搜尋引擎優化內容的策略——讓你的網站成為 AI 回答問題時的「引用來源」。</p>

<p>傳統 SEO 的目標是讓你的連結出現在搜尋結果第一頁。GEO 的目標是讓 AI 在回答問題時，直接引用你的內容，甚至把你的品牌說出來。</p>

<p>如果 AI 沒有引用你，對使用者來說，你的網站等於不存在。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=80" alt="AI 機器人思考與搜尋資訊的概念圖" loading="lazy" />
  <figcaption>AI 已經從「工具」變成了「守門員」——決定誰的內容被看見、誰被跳過。Photo by <a href="https://unsplash.com/@agk42" target="_blank" rel="noopener">Alex Knight</a> on Unsplash</figcaption>
</figure>

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

<figure>
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80" alt="數據分析儀表板，流量下滑圖表" loading="lazy" />
  <figcaption>流量下滑不一定是你的錯——但解決它是你的責任。Photo by <a href="https://unsplash.com/@dawson2406" target="_blank" rel="noopener">Stephen Dawson</a> on Unsplash</figcaption>
</figure>

<h2>在地 SEO 的逆勢機會</h2>

<p>壞消息說完了，現在說一個好消息：<strong>在地 SEO 是目前最能抵抗 GEO 衝擊的策略</strong>。</p>

<p>原因很簡單——當使用者搜尋「附近的診所」或「台北信義區美髮」，AI 知道自己無法確認「使用者現在在哪裡」，因此它仍然傾向把帶有地理資訊的搜尋導回 Google 地圖和在地搜尋結果。</p>

<p>換句話說，<strong>在地化搜尋是 AI 最難完全取代的部分</strong>。</p>

<h2>2026 年你應該立刻做的 5 件事</h2>

<h3>① 強化你的 Google 商家檔案（GBP）</h3>
<p>這是 AI 在地搜尋最重要的信號來源。確保你的商家資訊完整、類別正確、每週有新貼文、評論持續累積。這不只是給 Google 看的，也是給 AI 看的。</p>

<h3>② 在你的網站加入 Schema JSON-LD</h3>
<p>最少要有：<code>LocalBusiness</code>、<code>FAQPage</code>（常見問題）、<code>Review</code>（評論）。這些結構化資料讓 AI 理解你的商家定位，大幅提升被引用的機率。</p>

<h3>③ 建立「答案型」內容</h3>
<p>AI 偏好引用能直接回答問題的內容。例如：「台北哪個區的診所評價最好？」、「在地 SEO 多久才有效？」——把你的常見問題寫成完整文章，格式清晰、有具體數據、有明確結論。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=900&auto=format&fit=crop&q=80" alt="手機搜尋在地服務，Google 地圖顯示" loading="lazy" />
  <figcaption>當客人用手機搜尋「附近的⋯⋯」，你的商家是否出現在前三名？Photo by <a href="https://unsplash.com/@firmbee" target="_blank" rel="noopener">Firmbee.com</a> on Unsplash</figcaption>
</figure>

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
