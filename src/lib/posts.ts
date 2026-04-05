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
<p class="lead">2026 年 1 月 12 日，Dan Koe 在 X 上發了一篇文章。7 天後，閱讀次數突破 <strong>1.5 億</strong>。</p>

<p>他只有一個人、沒有團隊、不靠廣告。X 創作者分潤計畫 14 天內進帳 4,495 美元——但他說，這不是重點，後端的課程和工具才是。</p>

<p>這篇文章精選他 2025–2026 年 8 篇最受討論的發文原文，附中文翻譯與<strong>台灣在地行銷視角的深度解析</strong>。不是雞湯，是可以直接用的思考框架。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&auto=format&fit=crop&q=80" alt="筆記本上的手寫文字，創作思考" loading="lazy" />
  <figcaption>寫作是思考的外殼。Dan Koe 的商業模式建立在「先想清楚，再寫出來」的基礎上。Photo by <a href="https://unsplash.com/@glenncarstenspeters" target="_blank" rel="noopener">Glenn Carstens-Peters</a> on Unsplash</figcaption>
</figure>

<h2>① 你不在你想去的地方，因為你還不是那個人</h2>

<p><em>來源：〈How to Fix Your Entire Life in 1 Day〉— 2026 年 1 月 12 日，1.5 億次觀看</em></p>

<blockquote>
  <p>"You aren't where you want to be because you aren't the person who would be there. You often pursue 'unconscious goals' — like the goal of safety or the protection of a familiar identity — which keep us watching the construction rather than building our own."</p>
  <footer>— Dan Koe, January 2026</footer>
</blockquote>

<p><strong>中文翻譯：</strong>你不在你想去的地方，是因為你還不是那個會在那裡的人。你常常在追逐「無意識目標」——比如安全感、或者保護熟悉的自我認同——這讓我們只是旁觀別人蓋房子，而不是建造自己的。</p>

<p><strong>adlo 解析：</strong>很多台灣老闆想要「更多客人」，但行動上還是老樣子——沒有 Google 商家貼文、沒有評論回覆策略、沒有在地 SEO。問題不是資源，是身份認同：你有沒有把自己當成一個「認真在數位行銷的商家」？這個認同轉換，才是一切改變的起點。</p>

<h2>② 你有多種興趣？這是你的優勢，不是弱點</h2>

<p><em>來源：X 發文 — 2026 年 1 月</em></p>

<blockquote>
  <p>"If you have multiple interests, do not waste the next 2-3 years. Every person you admire is not a specialist. Specialists are tools, and tools get replaced."</p>
  <footer>— Dan Koe, January 2026</footer>
</blockquote>

<p><strong>中文翻譯：</strong>如果你有多種興趣，不要浪費接下來的 2–3 年。你欣賞的每個人都不是專家型的人。專家是工具，而工具會被取代。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&auto=format&fit=crop&q=80" alt="多工作業，桌上有筆電、筆記本、咖啡" loading="lazy" />
  <figcaption>在 AI 時代，能跨領域整合的人比單一專才更有價值。Photo by <a href="https://unsplash.com/@austindistel" target="_blank" rel="noopener">Austin Distel</a> on Unsplash</figcaption>
</figure>

<p><strong>adlo 解析：</strong>台灣的中小企業老闆本來就是全才——你同時是產品專家、銷售、財務、客服。這在 AI 時代不是缺點，是護城河。你對自己產業的深度理解 + 對在地市場的感知，是任何 AI 工具都無法複製的。把這些「複合知識」轉化成內容，就是你最獨特的行銷資產。</p>

<h2>③ 你最好的作品，是在你不工作的時候完成的</h2>

<p><em>來源：X 發文 — 2026 年 3 月</em></p>

<blockquote>
  <p>"It seems like everyone is obsessed with productivity and efficiency yet rarely get anything meaningful done. I'm convinced your best work is done when you're not working. When you have space for creative ideas to emerge that drastically change the trajectory of your life/work."</p>
  <footer>— Dan Koe, March 2026</footer>
</blockquote>

<p><strong>中文翻譯：</strong>感覺每個人都痴迷於生產力和效率，卻很少真正完成有意義的事。我深信你最好的作品是在你不工作的時候完成的——當你有空間讓創意想法浮現，那些能大幅改變你生命和工作軌跡的想法。</p>

<p><strong>adlo 解析：</strong>很多老闆忙到沒時間「想清楚行銷策略」。但不停地發廣告、追爆量技巧，反而是最低效的投入。花 30 分鐘想清楚：你的客人最常問什麼問題？這個答案，比花一整天設計廣告更有價值——因為它能指引接下來三個月的內容方向。</p>

<h2>④ AI 是讀者，不是作者</h2>

<p><em>來源：X 發文 — 2025 年 4 月</em></p>

<blockquote>
  <p>"As a writer, I've noticed that AI doesn't shorten my writing process (because I don't want it to), it makes it longer. I don't treat AI as the writer, I treat it as the reader. I have it raise objections to my points. I have it rate my hook and introduction for various metrics."</p>
  <footer>— Dan Koe, April 2025</footer>
</blockquote>

<p><strong>中文翻譯：</strong>身為一個寫作者，我發現 AI 沒有縮短我的寫作過程（因為我不希望它這樣），反而讓它變得更長。我不把 AI 當作者，我把它當讀者。我讓它對我的論點提出反對意見，讓它對我的開頭和引文進行各種指標的評分。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&auto=format&fit=crop&q=80" alt="與 AI 工具協作工作的場景" loading="lazy" />
  <figcaption>用 AI 質疑你的想法，比用 AI 產生想法更有價值。Photo by <a href="https://unsplash.com/@jasongoodman_youxventures" target="_blank" rel="noopener">Jason Goodman</a> on Unsplash</figcaption>
</figure>

<p><strong>adlo 解析：</strong>你下次用 AI 寫 Google 商家貼文或廣告文案時，試試這個：先自己寫，再請 AI 扮演「最挑剔的客人」——挑出你文案的邏輯漏洞、不清楚的地方、無法說服人的論點。這個流程產出的內容，比直接叫 AI 幫你寫好上 3 倍。</p>

<h2>⑤ AI 對寫作的衝擊被嚴重誇大</h2>

<p><em>來源：X 發文 + Newsletter — 2025 年 3 月</em></p>

<blockquote>
  <p>"I still feel like we're in a big experimentation phase with AI. I still can't let it touch my writing. Editing is okay and sparks some ideas. The best use case I've found (for me at least) is having it take information and spit out structured ideas for use in my writing."</p>
  <footer>— Dan Koe, March 2025</footer>
</blockquote>

<p><strong>中文翻譯：</strong>我還是覺得我們正處於 AI 的大型實驗階段。我還是無法讓它碰我的寫作。編輯還可以，能激發一些想法。我找到最好的用法（至少對我來說）是讓它吸收資訊、輸出結構化想法，供我在寫作中使用。</p>

<p><strong>adlo 解析：</strong>對台灣老闆來說，這是一個重要的解放：你不需要讓 AI 完全代替你寫行銷文案。你的生意故事、客戶案例、在地知識——這些 AI 不知道。用 AI 整理你的想法、生成文章大綱，再用你自己的語言寫出來，才是真正有效的 AI 輔助內容策略。</p>

<h2>⑥ 把你的人生變成電玩遊戲</h2>

<p><em>來源：X 發文 — 2025 年 5 月</em></p>

<blockquote>
  <p>"Your mind runs on a storyline. Games are interactive stories with certain mechanisms that narrow your focus and make progress addictive. If you want to get unstuck, use this AI prompt to turn your life into a video game."</p>
  <footer>— Dan Koe, May 2025</footer>
</blockquote>

<p><strong>中文翻譯：</strong>你的大腦靠故事線運作。遊戲是帶有特定機制的互動故事——能縮小你的注意力焦點，讓進步變得讓人上癮。如果你想打破僵局，用這個 AI 提示把你的人生變成電玩遊戲。</p>

<p><strong>adlo 解析：</strong>這個框架可以直接套用在你的在地行銷計畫上。設定清晰的「任務」——例如「本月取得 10 則新評論」「這週更新商家三張照片」——把它當成遊戲關卡來完成。進度可見、目標清晰，你的行銷執行力就會提高三倍。</p>

<figure>
  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80" alt="一個人專注工作，筆記本與電腦" loading="lazy" />
  <figcaption>把行銷任務拆成可完成的關卡，比一個模糊的「要做 SEO」目標有效十倍。Photo by <a href="https://unsplash.com/@craftedbygc" target="_blank" rel="noopener">Green Chameleon</a> on Unsplash</figcaption>
</figure>

<h2>⑦ 每個 CEO 都說 AI 要搶你的工作——我的看法</h2>

<p><em>來源：X 發文 — 2025 年 5 月 25 日</em></p>

<blockquote>
  <p>"It seems like every tech CEO and their mother won't stop talking about how AI is coming for your job. So I did the same thing. Here's my thoughts on the future of work and how to become AI first."</p>
  <footer>— Dan Koe, May 2025</footer>
</blockquote>

<p><strong>中文翻譯：</strong>感覺每個科技 CEO 都停不下來地說 AI 要搶你的工作。所以我也做了一樣的事。這是我對未來工作的想法，以及如何變成「AI 優先」的人。</p>

<p><strong>adlo 解析：</strong>「AI 優先」對中小企業的意義是：你的行銷流程裡，哪些重複性工作可以讓 AI 加速完成？客服回覆範本、Google 商家貼文草稿、廣告 A/B 測試文案——這些都可以用 AI 提速。但「AI 優先」不等於「AI 全包」，在地感知和客戶關係永遠需要你親自維護。</p>

<h2>⑧ 如何訓練 AI 產出病毒式推文結構</h2>

<p><em>來源：X 發文 — 2025 年 4 月</em></p>

<blockquote>
  <p>"Here's an example with training AI to interview me to get my own ideas, stories, and experiences then formatting them into viral tweet structures (use with caution and don't be dumb)."</p>
  <footer>— Dan Koe, April 2025</footer>
</blockquote>

<p><strong>中文翻譯：</strong>這是一個例子：訓練 AI 訪問我，提取我自己的想法、故事和經驗，然後將它們格式化成病毒式推文結構（謹慎使用，別傻了）。</p>

<p><strong>adlo 解析：</strong>你可以把這個邏輯套用在你的在地行銷上：請 AI 訪問你——你的商家故事、你服務最難忘的客戶、你如何解決一個棘手問題——然後讓 AI 把這些整理成 Google 商家貼文或部落格文章。你的故事本身就是最好的行銷素材，AI 只是幫你整理格式。</p>

<h2>總結：3 個 Dan Koe 思維，立刻用在你的在地行銷</h2>

<p>不需要 260 萬追蹤者才能用這些框架。把它縮小到你的商家規模：</p>

<ol>
  <li><strong>先成為那個人，再等結果。</strong>認真對待你的 Google 商家、把評論當作口碑資產、每週產出一則在地內容——這是「認真做數位行銷的商家」的身份認同行動。</li>
  <li><strong>AI 是讀者，你是作者。</strong>用 AI 質疑你的文案、整理你的想法、加速重複工作——但你的在地故事、客戶關係、服務專業，不外包。</li>
  <li><strong>把行銷任務變成遊戲關卡。</strong>本月 10 則評論、本週 3 篇商家貼文、這季更新一個落地頁——讓進度可見，執行力自然提高。</li>
</ol>

<div class="cta-box">
  <p>你的在地行銷現在缺哪一塊？adlo 提供免費初步評估，20 分鐘告訴你最有效的突破口在哪裡——不推銷、無壓力。</p>
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
