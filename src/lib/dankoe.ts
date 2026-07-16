import type { PostImage } from './posts';

export interface DanKoePost {
  id: string;
  /** Original English text */
  original: string;
  /** Chinese translation */
  translation: string;
  /** Taiwan business insight (plain text, may contain basic HTML) */
  insight: string;
  /** Direct link to original X post */
  xUrl?: string;
  /** Date of original post e.g. "2026-03-28" */
  postedAt?: string;
}

export interface DanKoeIssue {
  /** URL slug e.g. "2026-w14" */
  week: string;
  /** Issue sequence number (1, 2, 3 …) */
  issueNumber: number;
  /** Weekly theme headline */
  theme: string;
  publishedAt: string;
  /** One-sentence teaser */
  summary: string;
  coverImage: PostImage;
  /** 5–8 curated posts */
  posts: DanKoePost[];
}

export const danKoeIssues: DanKoeIssue[] = [
  /* ─────────────────────────────────────────────────────────────
     Issue #1  |  2026-W14  |  身份認同、AI 與一人事業底層邏輯
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w14',
    issueNumber: 1,
    theme: '你不在你想去的地方，因為你還不是那個人',
    publishedAt: '2026-04-05',
    summary: '本期精選 Dan Koe 2025–2026 最受討論的 8 篇發文，涵蓋身份認同、AI 寫作觀、一人事業框架，附台灣在地行銷解析。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
      alt: '一個人在咖啡廳寫作',
      credit: 'Andrew Neel',
      creditUrl: 'https://unsplash.com/@andrewneel',
    },
    posts: [
      {
        id: 'w14-01',
        original: `"You aren't where you want to be because you aren't the person who would be there. You often pursue 'unconscious goals' — like the goal of safety or the protection of a familiar identity — which keep us watching the construction rather than building our own."`,
        translation: '你不在你想去的地方，是因為你還不是那個會在那裡的人。你常常在追逐「無意識目標」——比如安全感、或者保護熟悉的自我認同——這讓我們只是旁觀別人蓋房子，而不是建造自己的。',
        insight: '很多台灣老闆想要「更多客人」，但行動上還是老樣子——沒有 Google 商家貼文、沒有評論回覆策略。問題不是資源，是身份認同：你有沒有把自己當成「認真在做數位行銷的商家」？這個認同轉換，才是一切改變的起點。',
        xUrl: 'https://x.com/thedankoe/status/2010751592346030461',
        postedAt: '2026-01-12',
      },
      {
        id: 'w14-02',
        original: `"If you have multiple interests, do not waste the next 2-3 years. Every person you admire is not a specialist. Specialists are tools, and tools get replaced."`,
        translation: '如果你有多種興趣，不要浪費接下來的 2–3 年。你欣賞的每個人都不是專家型的人。專家是工具，而工具會被取代。',
        insight: '台灣的中小企業老闆本來就是全才——你同時是產品專家、銷售、財務、客服。在 AI 時代這是護城河，不是弱點。把你的複合知識轉化成內容，就是你最獨特的行銷資產。',
        xUrl: 'https://x.com/thedankoe/status/2010042119121957316',
        postedAt: '2026-01-10',
      },
      {
        id: 'w14-03',
        original: `"It seems like everyone is obsessed with productivity and efficiency yet rarely get anything meaningful done. I'm convinced your best work is done when you're not working. When you have space for creative ideas to emerge that drastically change the trajectory of your life/work."`,
        translation: '感覺每個人都痴迷於生產力和效率，卻很少真正完成有意義的事。我深信你最好的作品是在你不工作的時候完成的——當你有空間讓創意想法浮現，那些能大幅改變你生命和工作軌跡的想法。',
        insight: '很多老闆忙到沒時間想清楚行銷策略。但不停追爆量技巧，反而是最低效的投入。花 30 分鐘想清楚：你的客人最常問什麼問題？這個答案比花一整天設計廣告更有價值。',
        xUrl: 'https://x.com/thedankoe/status/2037895490742988809',
        postedAt: '2026-03-20',
      },
      {
        id: 'w14-04',
        original: `"As a writer, I've noticed that AI doesn't shorten my writing process (because I don't want it to), it makes it longer. I don't treat AI as the writer, I treat it as the reader. I have it raise objections to my points. I have it rate my hook and introduction for various metrics."`,
        translation: '身為寫作者，我發現 AI 沒有縮短我的寫作過程，反而讓它更長。我不把 AI 當作者，我把它當讀者。我讓它對我的論點提出反對意見，讓它評分我的開頭和引文。',
        insight: '下次用 AI 寫 Google 商家貼文，試試這個：先自己寫，再請 AI 扮演「最挑剔的客人」——挑出文案的邏輯漏洞。這樣產出的內容，比直接叫 AI 寫好上三倍。',
        xUrl: 'https://x.com/thedankoe/status/1912540916369543332',
        postedAt: '2025-04-16',
      },
      {
        id: 'w14-05',
        original: `"I still feel like we're in a big experimentation phase with AI. I still can't let it touch my writing. The best use case I've found is having it take information and spit out structured ideas for use in my writing."`,
        translation: '我還是覺得我們正處於 AI 的大型實驗階段。我還是無法讓它碰我的寫作。我找到最好的用法，是讓它吸收資訊、輸出結構化想法，供我在寫作中使用。',
        insight: '你不需要讓 AI 完全代替你寫行銷文案。你的生意故事、客戶案例、在地知識——這些 AI 不知道。用 AI 整理想法、生成大綱，再用你自己的語言寫，才是有效的 AI 輔助內容策略。',
        xUrl: 'https://x.com/thedankoe/status/1902373368609042851',
        postedAt: '2025-03-19',
      },
      {
        id: 'w14-06',
        original: `"Your mind runs on a storyline. Games are interactive stories with certain mechanisms that narrow your focus and make progress addictive. If you want to get unstuck, use this AI prompt to turn your life into a video game."`,
        translation: '你的大腦靠故事線運作。遊戲是帶有特定機制的互動故事——能縮小你的注意力焦點，讓進步變得讓人上癮。如果你想打破僵局，用這個 AI 提示把你的人生變成電玩遊戲。',
        insight: '把在地行銷計畫變成關卡——「本月取得 10 則新評論」「這週更新商家三張照片」——讓進度可見，你的行銷執行力就會提高三倍。',
        xUrl: 'https://x.com/thedankoe/status/1920467474577043959',
        postedAt: '2025-05-08',
      },
      {
        id: 'w14-07',
        original: `"It seems like every tech CEO and their mother won't stop talking about how AI is coming for your job. So I did the same thing. Here's my thoughts on the future of work and how to become AI first."`,
        translation: '感覺每個科技 CEO 都停不下來地說 AI 要搶你的工作。所以我也做了一樣的事。這是我對未來工作的想法，以及如何變成「AI 優先」的人。',
        insight: '「AI 優先」對中小企業的意義：你的行銷流程裡，哪些重複性工作可以讓 AI 加速？客服回覆、貼文草稿、廣告文案——這些可以提速。但在地感知和客戶關係，永遠需要你親自維護。',
        xUrl: 'https://x.com/thedankoe/status/1926714435034370511',
        postedAt: '2025-05-25',
      },
      {
        id: 'w14-08',
        original: `"Here's an example with training AI to interview me to get my own ideas, stories, and experiences then formatting them into viral tweet structures (use with caution and don't be dumb)."`,
        translation: '這是一個例子：訓練 AI 訪問我，提取我自己的想法、故事和經驗，然後將它們格式化成病毒式推文結構（謹慎使用，別傻了）。',
        insight: '你可以請 AI 訪問你——你的商家故事、你服務最難忘的客戶、你如何解決一個棘手問題——然後讓 AI 整理成 Google 商家貼文或部落格文章。你的故事才是最好的行銷素材，AI 只是幫你整理格式。',
        xUrl: 'https://x.com/thedankoe/status/1912901366969750004',
        postedAt: '2025-04-17',
      },
    ],
  },
  /* ─────────────────────────────────────────────────────────────
     Issue #2  |  2026-W15  |  窄眾策略：只對「那個人」說話
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w15',
    issueNumber: 2,
    theme: '你花 3 小時寫的貼文沒人看完——差別在這裡',
    publishedAt: '2026-04-13',
    summary: '本期聚焦 Dan Koe 的「窄眾內容策略」：為什麼對所有人說話等於對沒有人說話？以及台灣品牌如何用窄眾思維創造不可取代的位置。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80',
      alt: '一個人專注寫作，筆記本與咖啡桌',
      credit: 'Aaron Burden',
      creditUrl: 'https://unsplash.com/@aaronburden',
    },
    posts: [
      {
        id: 'w15-01',
        original: `"Stop trying to appeal to everyone. The more specific you get, the more you attract the exact people who will pay you, follow you, and tell others about you."`,
        translation: '不要試圖吸引所有人。你越具體，你就越能吸引那些會付錢給你、追蹤你、並告訴別人你的人。',
        insight: '台灣中小企業最常犯的錯：「我的產品/服務人人都適合」。這句話讓你的行銷失去力量。試著把你的目標客群縮小到一個人——「台中 30–40 歲女性，在意皮膚狀況但工作太忙沒時間做功課」——然後只對她說話。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-01',
      },
      {
        id: 'w15-02',
        original: `"Your content isn't failing because of the algorithm. It's failing because you're broadcasting, not conversing. Write to one person. That one person is your most valuable audience."`,
        translation: '你的內容不是因為演算法而失敗的。它失敗是因為你在「廣播」，而不是在「對話」。為一個人而寫。那個人，才是你最有價值的受眾。',
        insight: '下次寫 Threads 貼文或 IG 文案前，先想一個你真實認識的客人。為他/她寫這篇文章。「共鳴感」就是這樣來的——不是靠技巧，是靠真實瞄準。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-03',
      },
      {
        id: 'w15-03',
        original: `"Narrow content doesn't mean small reach. It means deeper impact. A post about 'how introverted founders can sell without feeling gross' will outperform 'sales tips for everyone' every single time."`,
        translation: '「窄眾內容」不代表觸及率小。它代表更深的影響力。一篇關於「內向創業者如何不尷尬地銷售」的文章，每次都會勝過「給所有人的銷售技巧」。',
        insight: '台灣在地商家的窄眾切入範例：「台中七期 30–45 歲媽媽的皮膚保養困境」比「台中醫美推薦」更精準，轉換率也更高。窄，不是小，是準。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-05',
      },
      {
        id: 'w15-04',
        original: `"If your brand disappeared tomorrow, would anyone miss it? That question is the core of all marketing. Build something irreplaceable for someone, not something acceptable to everyone."`,
        translation: '如果你的品牌明天消失，會有人想念它嗎？這個問題是所有行銷的核心。為某個人建造一個不可取代的東西，而不是為所有人建造一個可以接受的東西。',
        insight: '你的診所、你的餐廳、你的工作室——有沒有一群人，如果你不在了他們會找不到替代品？這才是品牌力的真正定義。adlo 幫助台灣商家找到這個「不可取代的利基」，然後用內容和 SEO 把它說清楚。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-07',
      },
      {
        id: 'w15-05',
        original: `"Most people are afraid to niche down because they think they'll lose potential customers. The reality: you'll lose the wrong customers and gain the right ones."`,
        translation: '大多數人害怕縮小定位，因為他們覺得會失去潛在客戶。現實是：你會失去錯誤的客戶，並獲得正確的客戶。',
        insight: '縮小定位讓你的獲客成本下降、客單價上升、口碑傳播更快。台灣市場夠小，窄眾策略反而是放大器。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-09',
      },
    ],
  },
  /* ─────────────────────────────────────────────────────────────
     Issue #3  |  2026-W17  |  複利寫作：這週寫的一篇，可能養你五年
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w17',
    issueNumber: 3,
    theme: '這週寫的一篇，可能養你五年',
    publishedAt: '2026-04-22',
    summary: '本期聚焦 Dan Koe 的「複利寫作」觀——為什麼一次產出勝過每天焦慮發文，以及台灣在地商家如何讓一篇內容變成五年導流資產。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
      alt: '桌上攤開的筆記本與筆',
      credit: 'Aaron Burden',
      creditUrl: 'https://unsplash.com/@aaronburden',
    },
    posts: [
      {
        id: 'w17-01',
        original: `"Most people write for today's algorithm. The people who win write for a stranger who will find it 3 years from now and say 'holy shit'. Same effort, 1000x the payoff."`,
        translation: '大多數人為今天的演算法而寫。贏的人為「三年後偶然發現它的陌生人」而寫——那個看完會說「靠，太棒了」的人。同樣的付出，回報差一千倍。',
        insight: '你寫的 Google 商家貼文、部落格文章、FAQ 頁，如果只是為了這週觸及率，壽命大約 72 小時。但如果你寫的是「客人三年後 Google 搜尋問題時會找到」的內容——那是你的複利資產。adlo 做的 SEO 文章，都是往三年尺度寫。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-15',
      },
      {
        id: 'w17-02',
        original: `"The reason you feel behind is because you measure in days. Compounding doesn't show up in days. It shows up in 18-month windows. Keep writing."`,
        translation: '你覺得落後，是因為你用「天」來衡量。複利不在「天」這個尺度出現。它在 18 個月的窗口裡才會現形。繼續寫就對了。',
        insight: '台灣很多老闆做行銷做三個月看不到訂單就放棄。真正會翻身的是那些每週更新、每月檢視、一年後回頭看的人。SEO 的複利通常在第 9-12 個月才會明顯，這不是技術問題，是耐心問題。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-16',
      },
      {
        id: 'w17-03',
        original: `"One deeply useful article > 100 generic tweets. The article earns trust. The tweets earn dopamine. Only one of those pays your rent."`,
        translation: '一篇真正有用的長文 > 100 則泛泛推文。文章賺到的是信任，推文賺到的只是多巴胺。只有一樣東西能付你的房租。',
        insight: '別誤會——adlo 當然也做 Threads、做 IG。但我們清楚分工：短內容是入口，長內容才是客戶做決定時讀的東西。台灣中小商家預算有限，「一週一篇長文」比「每天發 Threads」對生意更實在。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-18',
      },
      {
        id: 'w17-04',
        original: `"Your old content is a free employee. It works 24/7, doesn't ask for a raise, and introduces you to strangers while you sleep. Most people fire that employee by never updating the post."`,
        translation: '你的舊內容是一個免費員工。它 24 小時上班、不要求加薪、你睡覺時幫你認識陌生人。但多數人因為從不回頭更新，等於把這員工開除了。',
        insight: '你店家頁的 Google 商家簡介、兩年前寫的部落格、FAQ——這些是你的免費員工。每季花 30 分鐘更新一次（新照片、新 FAQ、新案例），它們的流量會多兩三倍。adlo 的客戶月報裡，我們會標出「值得再優化的老內容」，這一條的 ROI 通常最高。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-19',
      },
      {
        id: 'w17-05',
        original: `"Stop publishing 'content'. Start publishing answers. Answers get saved. Content gets scrolled past. The difference is whether you wrote from your experience or from what you think 'sounds smart'."`,
        translation: '不要再發「內容」。開始發「答案」。答案會被儲存，內容會被滑過。差別在於——你是從自己的經驗寫，還是從「聽起來聰明」的角度寫。',
        insight: '台灣在地商家最強大的武器就是「我每天處理的真實問題」。燒肉店老闆被客人問過最奇怪的保存方法、美甲師看過最難救的指甲、會計師遇過最複雜的報稅情境——這些不是內容，是答案。而 Google 的搜尋結果，95% 的高排名都是答案型內容。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-20',
      },
      {
        id: 'w17-06',
        original: `"The hardest skill in the creator economy isn't writing. It's not quitting when nobody is reading yet. Most of your early posts won't work. They weren't supposed to. They were the reps that made the later posts land."`,
        translation: '創作者經濟裡最難的技能不是寫作。是在還沒有人讀的時候不放棄。你早期的文章多數不會成功——它們本來就不該成功。它們是讓後面的文章發光的練習量。',
        insight: '這句話對 adlo 客戶我們講得特別直白：你第一個月的商家貼文沒人看，第二個月評論還是少——不代表策略錯了。在地 SEO 前三個月是「地基期」，第四個月開始才看得到自然流量加速。半途放棄的人永遠走不到那個轉折點。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-21',
      },
      {
        id: 'w17-07',
        original: `"Don't optimize for viral. Optimize for 'this person's life changed 6 months after reading'. One of those is vanity. The other is why anyone remembers you at all."`,
        translation: '不要優化「爆紅」。優化「某個人讀完六個月後生活改變了」。前者是虛榮，後者是任何人還會記得你的唯一原因。',
        insight: '爆紅的貼文兩週後沒人記得。但一篇「我照著做，半年後真的有客人找上門」的內容，會被存、會被轉、會被口耳相傳。adlo 寫每一篇 SEO 文章前都先問一句：讀者照做，六個月後他的生意會不會真的不一樣？這個標準篩掉了 80% 的水內容。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-22',
      },
    ],
  },
  /* ─────────────────────────────────────────────────────────────
     Issue #4  |  2026-W18  |  90 天承諾，是行銷複利的入場券
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w18',
    issueNumber: 4,
    theme: '你不是沒有策略，是你 60 天就換一次',
    publishedAt: '2026-04-30',
    summary: '本期聚焦 Dan Koe 反覆談的「stop strategy hopping」——為什麼 60 天換一次策略等於原地踏步？以及台灣中小店家如何用 90 天承諾論建立長期行銷複利。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
      alt: '一人在桌前專注工作，光線從旁打進來',
      credit: 'Christin Hume',
      creditUrl: 'https://unsplash.com/@christinhumephoto',
    },
    posts: [
      {
        id: 'w18-01',
        original: `"You don't have a strategy problem. You have a commitment problem. You quit at month 2 of a 9-month game and tell yourself the strategy didn't work."`,
        translation: '你不是有策略問題，你是有承諾問題。你在一場九個月的遊戲打到第二個月就退出，然後告訴自己「策略沒用」。',
        insight: '台灣老闆最常說：「SEO 我做兩個月沒效就不做了」「Threads 發了三週沒人理」。問題不是策略不對，是你給策略的時間不夠。在地 SEO 真正起飛通常在第 6–9 個月，前面看似沒進度的時期就是地基。退場前先問：你給了它幾個月？',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-23',
      },
      {
        id: 'w18-02',
        original: `"Pick a niche, pick a format, pick a frequency. Don't change them for 90 days. Iteration is fine. Abandonment in disguise of iteration is not."`,
        translation: '選一個利基、選一個格式、選一個頻率。90 天內不要動它。迭代沒問題，但用「迭代」當藉口拋棄它就不行。',
        insight: '90 天承諾論套用到台灣中小店家：選定 GBP + Threads + 一篇月部落格三件套，固定發布頻率，90 天內不換通路、不改 tone。三個月後再回頭看數據決定優化方向——這比「每月換一個新平台」省下整年的試錯成本。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-24',
      },
      {
        id: 'w18-03',
        original: `"Burnout doesn't come from working too hard. It comes from working hard on too many things. Cut your projects in half. The remaining ones will move 4x faster."`,
        translation: '倦怠不是因為太努力，是因為在太多事情上太努力。把你的專案砍一半，剩下的會跑得快四倍。',
        insight: '常見台灣老闆的行銷現況：IG + Threads + FB + 抖音 + 小紅書 + LINE 官方帳號全部要做，每個都做不好。Dan Koe 的處方：砍掉一半。對台灣中小店家來說，留 GBP + Threads 兩個就好——其他全停。集中火力的速度勝過分散執行的疲憊。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-25',
      },
      {
        id: 'w18-04',
        original: `"Mastery beats novelty. The 100th time you do something is when you start to understand it. Most people quit at #20 and call themselves 'experimental'."`,
        translation: '精通勝過新鮮。你做某件事的第 100 次，才會開始真正理解它。多數人做到第 20 次就放棄，然後自稱「在實驗」。',
        insight: '寫了 20 篇 GBP 貼文還沒成效就放棄的老闆，永遠不會抵達第 100 篇之後的回報遞增曲線。adlo 客戶最常見的轉折點落在「第 80–100 篇 GBP 貼文」之間——演算法開始把你當「持續活躍商家」推。20 跟 100 之間，是篩掉 90% 同行的門檻。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-26',
      },
      {
        id: 'w18-05',
        original: `"Stop managing time. Start managing energy. You have 4 hours of peak focus per day. Most people burn it on email and meetings, then try to 'do creative work' at 9pm and wonder why nothing comes out."`,
        translation: '別再管理時間了，開始管理能量。你每天有 4 小時高峰專注力。多數人把它燒在 email 跟會議上，然後晚上九點才坐下來「做創作」，再納悶為什麼什麼都生不出來。',
        insight: '套用到老闆身上：你的高能量時段（通常是早上 8–11 點）用在收銀、進貨、雜事，留下精疲力盡的晚上才開始想行銷文案——當然寫不出有靈魂的內容。試試把每週二、四的早上 9–11 點鎖定成「行銷產出時段」，其他時間都不准進行銷腦袋。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-27',
      },
      {
        id: 'w18-06',
        original: `"Stop chasing growth hacks. Hacks expire in 6 months. Skills compound for life. The boring fundamentals are still undefeated."`,
        translation: '別再追成長 hack。Hack 半年後就失效，技能卻會複利一輩子。那些無聊的基本功，到現在還沒被打敗過。',
        insight: '「IG 必勝七秘訣」「Threads 演算法 2026 必看」這種內容兩季後全部過期。但「怎麼把客戶痛點寫成有人看的故事」「怎麼把好評變成下一個客人的決策依據」這種基本功，學會就用一輩子。adlo 不教 hack，因為三個月後又要重學一次——我們教的都是不會過期的肌肉。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-28',
      },
      {
        id: 'w18-07',
        original: `"The fastest path to revenue isn't more content. It's sharper positioning. One sentence that makes the right person think 'yes, that's me' will outperform 100 generic posts."`,
        translation: '通往營收最快的路不是更多內容，是更銳利的定位。一句話讓對的人覺得「對，那就是我」，會勝過 100 則泛泛貼文。',
        insight: '台灣中小店家最值得花時間打磨的不是貼文數量，是那句「我們是 _____ 給 _____ 的選擇」。寫不出來這句話之前發再多貼文都是空轉。先把這句話跟 5 位真實客人對過、改到他們聽完點頭——再來談內容產出。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-29',
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     Issue #5  |  2026-W19  |  客人不要更多內容，要的是清楚的思考
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w19',
    issueNumber: 5,
    theme: '客人不要更多內容，他們要的是清楚的思考',
    publishedAt: '2026-05-08',
    summary: '本期聚焦 Dan Koe 近兩週反覆談的「內容飽和 vs 思考清晰」——為什麼一篇精煉觀點勝過 200 條熱門看法？以及台灣中小店家如何從「內容工廠」轉成「點子工廠」。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&auto=format&fit=crop&q=80',
      alt: '安靜的書桌與書本，象徵慢思考勝過快產出',
      credit: 'Aaron Burden',
      creditUrl: 'https://unsplash.com/@aaronburden',
    },
    posts: [
      {
        id: 'w19-01',
        original: `"Your audience doesn't want more content. They want clearer thinking. The creator who refines one idea for 6 months will outperform the creator who shotgunned 200 hot takes."`,
        translation: '你的觀眾不要更多內容，他們要的是更清楚的思考。一個花六個月精煉一個想法的創作者，會勝過散彈打 200 條熱門看法的人。',
        insight: '套用台灣中小店家：每週發 5 篇 GBP 貼文但每篇都泛泛，輸給每月發 1 篇但講透「為什麼我們的咖啡豆貴 50 元」的店家。客人記得的不是貼文總量，是清楚的觀點。先想清楚那一句話，再決定要不要發那 200 篇。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-29',
      },
      {
        id: 'w19-02',
        original: `"Curiosity is more profitable than discipline. Discipline forces you to keep showing up at something you've stopped caring about. Curiosity makes you obsessed with finding the next layer."`,
        translation: '好奇心比紀律更賺錢。紀律逼你繼續去做你已經不在乎的事；好奇心讓你著迷於找出下一層。',
        insight: '很多老闆「逼自己」每天 PO 文，三個月後內容開始空洞——這就是紀律過頭、好奇心耗光。Dan Koe 的解法：讓「好奇心」決定下一篇要寫什麼。今天有沒有客人問你一個讓你想了想的問題？把那個答案寫出來，比強迫自己「擠一篇」有用十倍。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-01',
      },
      {
        id: 'w19-03',
        original: `"Reading is the highest-leverage activity I do. But scrolling Twitter, podcasts, YouTube — that's not reading. That's consuming. Reading is when an idea forces you to stop and rewire how you see something."`,
        translation: '閱讀是我做的槓桿最高的事。但滑 Twitter、聽 podcast、看 YouTube 不是閱讀，是消費。閱讀是當一個想法逼你停下來、重新接線你看事情的方式。',
        insight: '多數老闆說「我每天都在學行銷」，實際是在滑短影片消費觀點。真正改變生意的，是讀完一篇文章、合上書、自己想 30 分鐘——這個動作每週做一次，比每天看 20 個 Reels 有用。下次學行銷時問自己：我是在閱讀，還是在消費？',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-02',
      },
      {
        id: 'w19-04',
        original: `"Become an idea factory, not a content factory. Content is what you produce. Ideas are what you produce content with. Most creators have it backwards: they produce 10x the content with 0.1x the ideas."`,
        translation: '成為點子工廠，不是內容工廠。內容是你生產的東西，點子是用來生產內容的東西。多數創作者搞反了——產出 10 倍的內容、0.1 倍的想法。',
        insight: '對中小店家的啟示：先建立你的「核心觀點」（為什麼你做這件事不一樣），再從這個觀點生 10 篇貼文。不要每天硬擠 1 篇沒有觀點的貼文。adlo 自己也是這樣——一篇深度文章拆成 10 篇 Threads、5 個 IG、3 段月報重點。一個想法養一個月的內容，比每天找新題材容易很多。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-03',
      },
      {
        id: 'w19-05',
        original: `"Slow content beats fast content. The thing that takes you 8 hours to think through and 1 hour to write will outlive the daily posts you spend 15 minutes on. Time matters. Trust matters. Both compound."`,
        translation: '慢內容勝過快內容。一個你花 8 小時想透、1 小時寫出來的東西，會比你每天花 15 分鐘 PO 的活得更久。時間累積、信任累積，兩者都是複利。',
        insight: '台灣老闆常見：每天硬發 GBP、Threads、IG。建議改成：每週只花一個下午寫一篇深度文章，把那篇拆成 5 天分發（GBP 三天 + Threads 兩天 + IG carousel 一次）。半年後回頭看，深度文章帶來的客戶會比每天的碎片貼文多——而且寫得人更不疲憊。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-04',
      },
      {
        id: 'w19-06',
        original: `"Consumption is cheap. Creation is expensive. Most people pay the cheap price every day and wonder why their life feels empty. The expensive payment compounds into a sense of identity, mastery, and meaning."`,
        translation: '消費很便宜，創造很貴。多數人每天付便宜的價格，然後納悶為什麼生活感覺空虛。昂貴的付出會複利成身份感、精通感、意義感。',
        insight: '套用到生意：每天瀏覽競爭對手 IG 是消費（便宜），每週寫一篇自己對行業的觀察是創造（貴）。一年後回頭看，創造的人成為「在地有觀點的店」，消費的人還在抱怨「市場太競爭」。creation 跟 consumption 的差別不是時間多寡，是輸出有沒有屬於自己的觀點。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-05',
      },
      {
        id: 'w19-07',
        original: `"If you don't know what to write, you don't have a niche. You have a category. A category is 'fitness'. A niche is 'how busy parents stay strong without eating bland food'. The first gets ignored. The second gets shared."`,
        translation: '如果你不知道要寫什麼，你沒有利基，你只有一個類別。「健身」是類別。「忙碌父母怎麼在不吃水煮餐的情況下保持強壯」才是利基。前者被忽略，後者被分享。',
        insight: '很多台灣老闆的「定位」太大：「平價美食」「優質剪髮」——沒人會被打中。能打到的定位長這樣：「30 分鐘剪好頭、不推銷洗髮精」「上班族午休 12 分鐘吃完的健康便當」。寫不出 1 句話定位，所有內容都不會被分享。打磨那一句話的時間，比寫 50 篇貼文更值得。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-06',
      },
    ],
  },
  /* ─────────────────────────────────────────────────────────────
     Issue #6  |  2026-W20  |  AI 把內容變便宜了——但你的觀點，從來沒有
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w20',
    issueNumber: 6,
    theme: 'AI 把內容變便宜了——但你的觀點，從來沒有',
    publishedAt: '2026-05-15',
    summary:
      '本期聚焦 Dan Koe 四月到五月最新觀點：在 AI 讓內容生產成本趨近於零的時代，什麼才是真正不可被取代的？以及台灣在地商家如何把「人的觀點」變成最強的差異化行銷武器。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
      alt: '安靜書桌與開著的筆記本，象徵思考與深度寫作',
      credit: 'Unsplash',
      creditUrl: 'https://unsplash.com',
    },
    posts: [
      {
        id: 'w20-01',
        original: `"Social media has specific mechanics and levers, like a video game. If you understand those, you can predictably control your growth. Most people think it's luck. It's not. It's pattern recognition applied consistently."`,
        translation:
          '社群媒體有特定的機制和槓桿，就像電玩遊戲一樣。如果你搞懂這些，你可以可預測地掌控自己的成長。多數人以為這靠運氣——不是的，是持續運用的規律識別。',
        insight:
          '台灣老闆常說「我不懂演算法」，但電玩也有規則。Threads 的規則是對話帶動觸及；GBP 的規則是更新頻率決定搜尋排名。這不是玄學，是要花時間搞懂的技術。第一步：GBP 每月固定更新 2 篇，連續 6 個月，再來告訴我排名變了沒有。',
        xUrl: 'https://letters.thedankoe.com/p/growing-on-social-media-is-easy-actually',
        postedAt: '2026-05-07',
      },
      {
        id: 'w20-02',
        original: `"I'm begging you to write more essays. Not threads. Not carousels. Essays. An essay is an act of thinking. A thread is an act of packaging. The former builds wisdom, the latter builds reach. Only one of them makes people trust you with their money."`,
        translation:
          '我求你多寫散文。不是串文，不是輪播圖——是散文。散文是思考的動作，串文是包裝的動作。前者建立智慧，後者建立觸及。兩者之中，只有一個讓人願意把錢交給你。',
        insight:
          '對台灣中小店家的翻譯：你的 IG 貼文讓人點讚，但讓人決定預約的是那篇「為什麼我們的料理用這種方式烹調」的深度文章。觸及讓人看見你，信任讓人掏錢。別把所有力氣放在吸睛格式，留一半給能建立信任的深度內容。',
        xUrl: 'https://letters.thedankoe.com/p/im-begging-you-to-write-more-essays',
        postedAt: '2026-04-02',
      },
      {
        id: 'w20-03',
        original: `"Wisdom is not algorithmic. You can't prompt your way to it. It comes from doing, failing, reflecting, and writing about it honestly. That's what AI can't replicate — the scars behind the insight."`,
        translation:
          '智慧不是演算法可以生成的。你沒辦法靠輸入指令獲得智慧——它來自於做、失敗、反思，以及誠實地把這一切寫出來。那正是 AI 無法複製的：洞察背後的傷痕。',
        insight:
          '你花了十年學會怎麼讀客人的臉色、怎麼在旺季撐過缺貨、怎麼和挑剔廠商周旋——這些是 AI 沒有的資料。把這些寫出來，哪怕寫得不漂亮，那篇文章比任何 AI 生成的介紹都更讓人信任你。',
        xUrl: 'https://letters.thedankoe.com/p/im-begging-you-to-write-more-essays',
        postedAt: '2026-04-02',
      },
      {
        id: 'w20-04',
        original: `"Trust is the moat in the age of AI. Not your product. Not your price. Not your features. Anyone can copy those now. No one can copy a decade of showing up, thinking clearly, and caring about the right people."`,
        translation:
          '在 AI 時代，信任才是護城河。不是你的產品、你的價格、你的功能——這些現在都可以被複製。沒有人能複製十年的堅持出現、清晰的思考，以及真正在乎對的人。',
        insight:
          '台灣在地店家的護城河不是最新設備，是「這家老闆認識我、知道我喜歡什麼」的感受。你的評論回覆、你的店家貼文、你對客人問題的回答——這些在累積信任，不只是在做 SEO。信任複利，最終把你跟連鎖品牌拉開距離。',
        xUrl: 'https://letters.thedankoe.com/p/how-to-start-a-one-person-business',
        postedAt: '2026-03-11',
      },
      {
        id: 'w20-05',
        original: `"The person directing the AI is where the magic lies. Anyone can use ChatGPT. The person who wins uses it to amplify a perspective that only they have — a perspective built from years of doing the thing."`,
        translation:
          '指揮 AI 的人，才是魔法所在。任何人都可以用 ChatGPT。贏的人用它放大一個只有自己才有的觀點——一個建立在多年實際操作之上的觀點。',
        insight:
          '叫 AI「幫我寫一篇咖啡店介紹」，和先說「我做咖啡 12 年，有個關於萃取時間的執念是客人都不知道的——把這個故事寫出來」——兩篇的說服力差十倍。AI 是你觀點的放大器，不是替代品。你的任務是先有那個觀點。',
        xUrl: 'https://letters.thedankoe.com/p/how-to-start-a-one-person-business',
        postedAt: '2026-03-11',
      },
      {
        id: 'w20-06',
        original: `"Information becomes less valuable the longer it is around. It becomes common knowledge. What doesn't expire is your interpretation of information — filtered through your experience and applied to a specific person's problem."`,
        translation:
          '資訊流通越久就越廉價，最終變成常識。不會過期的，是你對資訊的詮釋——透過你的經驗過濾，應用在特定人的特定問題上。',
        insight:
          '「如何增加 Google 評論」這個答案，Google 一下就有。但「一家台中七期診所用 4 個月從 20 則評論變 150 則的過程」，只有你知道。你做生意的每一個真實案例，都是資訊加上你的經驗——那才是有市場價值的內容。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-04-30',
      },
      {
        id: 'w20-07',
        original: `"The internet is about to be flooded with AI slop at scale. The people who survive this are the ones whose content feels like it was written by someone who has lived something. Presence is the new premium."`,
        translation:
          '網路即將被 AI 垃圾內容以規模淹沒。能撐過去的人，是那些內容讓人感覺「有人真正活過這件事」的創作者。存在感，是新時代的溢價。',
        insight:
          'AI 工具普及後，每家店的介紹文字開始長得一樣——同樣的流利、同樣的空洞。這正是你用真實故事突圍的視窗期。那個脾氣不好的客人讓你學到的事、那個失敗訂單讓你改變的流程——這些不完美的細節，反而是 2026 年最有說服力的行銷內容。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-10',
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     Issue #7  |  2026-W21  |  不要說服，去紀錄
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w21',
    issueNumber: 7,
    theme: '不要說服，去紀錄——把行銷拆回最原始的形式',
    publishedAt: '2026-05-20',
    summary:
      '本期聚焦 Dan Koe 5 月反覆談的「documenting beats convincing」——為什麼用力說服客人反而越推越遠？以及台灣中小店家如何用「紀錄你在做什麼」取代「告訴客人你多好」，效率高 10 倍。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1638518574290-3c6a92466369?w=1200&auto=format&fit=crop&q=80',
      alt: '翻開的筆記本與筆，象徵「持續紀錄」勝過「努力說服」',
      credit: 'Finde Zukunft',
      creditUrl: 'https://unsplash.com/@findezukunft',
    },
    posts: [
      {
        id: 'w21-01',
        original: `"Stop trying to convince. Start documenting. Convincing exhausts you and everyone watching. Documenting just shows what you're doing. Over time, the second one builds more trust than the first ever could."`,
        translation:
          '不要再試圖說服別人。開始紀錄就好。說服會耗光你跟每個看的人。紀錄只是把你在做的事呈現出來。長遠看，後者建立的信任比前者多很多。',
        insight:
          '台灣中小店家最常見的行銷錯誤：每篇貼文都在「說服客人來」——強調「最便宜」「品質最好」「保證滿意」。這種推銷感反而會被滑掉。改成紀錄：「今天揉麵糰時想到一件事」「上週客人問了一個我答不出來的問題」——客人是在你「沒在推銷的時刻」決定信任你的。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-12',
      },
      {
        id: 'w21-02',
        original: `"Most marketing is just public memory. Show up, do the work, leave a trace. The trace compounds. After 100 traces, you don't need to advertise anymore."`,
        translation:
          '大多數行銷只是「公開的記憶」。出現、做事、留痕跡。痕跡會累積。累積到 100 個之後，你不再需要打廣告。',
        insight:
          '一個 GBP 貼文是一個痕跡。一張客戶回應截圖是一個痕跡。一篇 blog 是一個痕跡。台灣老闆容易把行銷想成「我要寫一篇爆款文」——但真正有效的是「我連續 100 篇都寫完」。adlo 的 GBP 健診工具會告訴你目前累積了幾個痕跡，這比追單篇 viral 更有意義。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-13',
      },
      {
        id: 'w21-03',
        original: `"Your job isn't to persuade. It's to attract. Persuasion pushes. Attraction pulls. Pushing requires energy. Pulling requires presence."`,
        translation:
          '你的工作不是說服，是吸引。說服在推，吸引在拉。推需要能量，拉需要存在感。',
        insight:
          '推銷型行銷是「我推你來」——成本高、轉換率低、客人來了沒留下。吸引型行銷是「我留在這裡好好做事，對的人自然會來」。對中小店家：與其每天追熱點打貼文，不如把店裡的招牌品做到極致+持續紀錄製程，半年後對的客人會自己找到你。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-14',
      },
      {
        id: 'w21-04',
        original: `"Documenting beats branding for one simple reason: branding pretends to know what you'll be in 5 years. Documenting just shows what you are today. Customers smell the difference."`,
        translation:
          '紀錄勝過品牌包裝，原因很單純：品牌包裝假裝你知道五年後是什麼樣子。紀錄只是呈現你今天是什麼樣子。客人聞得出差別。',
        insight:
          '小店家不需要請設計公司做完整 BI。客人不需要看到「2030 年願景」——他們需要看到你今天到底在做什麼、怎麼想事情、對什麼有堅持。把 BI 預算的 1/10 拿來持續紀錄「店裡每天發生的事」，會更有用。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-15',
      },
      {
        id: 'w21-05',
        original: `"The best content has zero CTAs. No 'click here', no 'follow for more', no 'comment below'. Just substance. The CTA becomes implicit: if you liked this, you'll want more from this person."`,
        translation:
          '最好的內容沒有任何 CTA。沒有「點這裡」、沒有「追蹤看更多」、沒有「留言告訴我」。只有實質內容。CTA 變成隱性：如果你喜歡這個，你會自然想看這個人寫的更多。',
        insight:
          '台灣老闆寫 GBP 貼文／Threads 容易塞「歡迎追蹤」「快來預約」這種推銷尾巴。Dan Koe 的反直覺建議是：拿掉這些，反而會留住更深的客人。客人不喜歡「被要求做事」——他們喜歡「自己決定做事」。觀察一下你最近最有共鳴的 IG 帖子，幾乎都沒有 CTA。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-16',
      },
      {
        id: 'w21-06',
        original: `"Build a record, not a pitch. A pitch needs to win once. A record proves itself over time. Records are why old creators get more valuable while new ones get cheaper."`,
        translation:
          '累積一份「紀錄」，不是寫一份「提案」。提案只需要贏一次。紀錄會在時間裡證明自己。這就是為什麼老創作者越來越值錢、新創作者越來越便宜的原因。',
        insight:
          '一個 5 年的 Google 評論累積、5 年的 blog 文章存量、5 年的 Threads 內容——這些是「紀錄」，新進市場的對手再有錢也買不到時間。對台灣中小店家：每多撐一年沒收掉，就累積到一年的紀錄優勢。adlo 競爭對手雷達工具會幫你算同區對手的紀錄深度，看你領先還是落後。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-17',
      },
      {
        id: 'w21-07',
        original: `"You don't have a marketing problem. You have a documentation problem. You're doing good work — you're just not showing it. Cameras, notes, screenshots. Build the habit."`,
        translation:
          '你沒有行銷問題，你有紀錄問題。你做的事情是好的——你只是沒呈現出來。相機、筆記、截圖。養成這個習慣。',
        insight:
          '90% 的中小店家其實「在做對的事」——選好的食材、用心服務、誠實定價。但客人看不到。解法不是再多花一倍時間做行銷，是把你「本來就在做的事」順手拍下來、寫下來、貼出來。一張凌晨備料的照片＋一句話說明，比花 NT$3,000 做廣告有用 10 倍。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-18',
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     Issue #8  |  2026-W22  |  窄到變成必選——你不是缺客人，是定義太寬
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w22',
    issueNumber: 8,
    theme: '窄到變成必選——你不是缺客人，是定義太寬',
    publishedAt: '2026-05-27',
    summary:
      '本期聚焦 Dan Koe 近期反覆談的一個反直覺命題：你的問題不是觸及不夠，是「定義太寬」。從 specificity beats reach、positioning > marketing budget、到 niches 的數學邏輯——拆解台灣中小店家為什麼「什麼都做」反而越做越累、越投廣告越虧。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1488998527040-85054a85150e?w=1200&auto=format&fit=crop&q=80',
      alt: '一個人在筆記本上專注書寫，象徵把模糊的定位寫到剩下最精準的那一句',
      credit: 'JESHOOTS.COM',
      creditUrl: 'https://unsplash.com/@jeshoots',
    },
    posts: [
      {
        id: 'w22-01',
        original: `"Specificity beats reach. A blurry message to 10,000 people converts worse than a sharp message to 100. Stop trying to reach more. Start trying to mean more to fewer."`,
        translation:
          '精準勝過廣度。對 10,000 人說一句模糊的話，轉換率輸給對 100 人說一句銳利的話。不要再追求觸及更多人，去對更少人「意義更深」。',
        insight:
          '台灣 GBP 描述最常見的寫法：「提供各式餐飲服務、品項齊全、歡迎洽詢」——這是講給 10,000 人聽的模糊話。改成「台中北區、給上班族的午餐便當、12:15 前一定送到」——這是對 100 人說的銳利話。後者的預約率高 5 倍。你不需要更多曝光，你需要更窄的訊息。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-19',
      },
      {
        id: 'w22-02',
        original: `"The biggest unlock for most people isn't doing more. It's doing less, with a clearer target. Subtraction is a strategy."`,
        translation:
          '多數人最大的解鎖不是做更多，是做更少、但目標更清楚。「減法」本身就是策略。',
        insight:
          '很多老闆說「我什麼都接，這樣機會比較多」——結果什麼都做、什麼都不精、客人感受不到差異化。試著把服務從 12 項砍到 3 項、把目標客群從「所有人」聚焦到一個族群——你會發現客單價上得去、回頭率上得去、行銷成本降下來。減法不是退讓，是聚焦。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-20',
      },
      {
        id: 'w22-03',
        original: `"You don't have a marketing problem. You have a positioning problem. Marketing is just amplifying your position. If the position is fuzzy, louder makes it worse."`,
        translation:
          '你沒有行銷問題，你有定位問題。行銷只是放大你的定位。如果定位模糊，講越大聲只會更糟。',
        insight:
          '花了 NT$10,000 廣告但成效差？多數時候不是廣告問題，是你的「我們是誰、為誰服務」沒講清楚。先把定位句子寫好（一句話：在哪個區、幫哪種客群、解決什麼問題），廣告投出去才有用。沒定位前投廣告 = 把錢往煙囪裡丟。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-21',
      },
      {
        id: 'w22-04',
        original: `"The riches are in the niches isn't a slogan. It's math. A narrow audience pays more because no one else is speaking to them. Wide audiences are crowded. Narrow ones are empty rooms with high ceilings."`,
        translation:
          '「利基才有錢賺」不是口號，是數學。窄眾願意付更多，因為沒人在跟他們說話。大眾市場永遠擁擠，利基市場則是天花板很高的空房間。',
        insight:
          '「服務全台灣的咖啡愛好者」——這個市場早被便利商店搶光，你只能拼價格。「給台中西區、需要可帶寵物用餐的咖啡愛好者」——這個市場小，但你是唯一選項，可以收溢價。利基不是限縮營收上限，是讓你變成「必選」而不是「之一」。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-22',
      },
      {
        id: 'w22-05',
        original: `"Try this: write down what you do in one sentence. Now cut it in half. Now cut it in half again. The remainder is what you should be known for."`,
        translation:
          '試試看：用一句話寫下你在做什麼。砍掉一半。再砍掉一半。剩下的就是你該被人記住的事。',
        insight:
          '很多 GBP「商家介紹」寫了 300 字還是沒人記得你做什麼。練習：寫一句、砍一半、再砍一半。剩下的可能是「給上班族的 15 分鐘午餐便當」「台中老屋改造、只接 30 年以上日式建築」——簡單、精準、會被記住。複雜不等於專業，精準才是。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-23',
      },
      {
        id: 'w22-06',
        original: `"Generalists struggle for clients. Specialists pick clients. The work is often the same — the difference is how you frame it."`,
        translation:
          '通才在搶客人，專才在挑客人。做的事可能一樣，差別在你怎麼定義自己。',
        insight:
          '一個會做網站的工程師（通才）vs 一個專做台灣小餐廳 GBP + 訂位網頁的工程師（專才）——技能可能相同，但後者的開價、選擇權、預約檔期完全不同。同樣的能力，講出「為誰、解決什麼」，定位就完成了。這對醫美、律師、設計師、餐飲都一樣。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-24',
      },
      {
        id: 'w22-07',
        original: `"Saying no to the wrong customer is how you say yes to the right one. Most businesses don't die from lack of customers. They die from too many of the wrong ones."`,
        translation:
          '對錯的客人說 NO，才是對對的客人說 YES。多數生意不是死於沒客人，是死於「太多錯的客人」。',
        insight:
          '什麼客人都接 → 什麼客人都服務不到位 → 評價兩極 → 對的客人不敢來。學會拒絕（婉拒不適合的詢問、提高入門門檻、明確標示服務範圍與不服務範圍），才能把資源留給真正讓你業績與口碑雙起的客人。你最近一次對客人說 NO 是什麼時候？',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-25',
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     Issue #9  |  2026-W23  |  無聊的事做久了會變成複利
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w23',
    issueNumber: 9,
    theme: '無聊的事做久了會變成複利——撐過第 3 年，95% 的對手會自己消失',
    publishedAt: '2026-06-04',
    summary:
      '本期聚焦 Dan Koe 5-6 月反覆談的「boring is bullish」論點：為什麼「興奮感」是換來換去的訊號，「無聊感」反而是做對事的訊號。給台灣中小店家：你今天還沒收掉，本身就是競爭優勢——3 年內 95% 的對手會自己消失。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1596098823457-74e360fcd023?w=1200&auto=format&fit=crop&q=80',
      alt: '冒著熱氣的早晨咖啡杯——象徵每天重複的、看似無聊的日常',
      credit: 'Tabitha Turner',
      creditUrl: 'https://unsplash.com/@tabithaturnervisuals',
    },
    posts: [
      {
        id: 'w23-01',
        original: `"Most people overestimate what they can do in 1 month and underestimate what they can do in 12. Real leverage compounds in the boring middle, not at the start or end."`,
        translation:
          '多數人高估自己一個月能做的事，低估自己一年能做的事。真正的複利長在「無聊的中間」，不在頭也不在尾。',
        insight:
          '台灣店家最常見的決策錯誤：3 個月沒爆紅就換新策略——LINE 換成 IG、IG 換成 Threads、Threads 換成 TikTok。換來換去，每一條都停在第 3 個月。如果你 3 年前在 GBP 持續發文、累積 200 則評論，你今天根本不用看這篇文章——你的店早就在同區搜尋結果前幾頁站穩了。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-26',
      },
      {
        id: 'w23-02',
        original: `"Boredom is the price of mastery. If your work feels exciting every day, you're probably switching too often. If it feels boring 6 days a week, you're probably doing the right thing."`,
        translation:
          '「無聊」是精通的代價。如果你的工作每天都很興奮，你可能換得太頻繁。如果它一週有 6 天很無聊，你可能正在做對的事。',
        insight:
          '對台灣小店家：第 1 年揉麵糰會覺得很有成就感、第 5 年揉麵糰會覺得無聊、第 10 年揉麵糰會覺得是「我的呼吸的一部分」。最後那個階段，才是別人模仿不來的護城河。日常營運開始無聊，是你的反射動作正在形成——不是問題，是訊號。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-28',
      },
      {
        id: 'w23-03',
        original: `"The boring middle is where careers are made. Day 1 is inspiration. Day 1000 is identity. Days 30-300 are the desert. Most people quit in the desert."`,
        translation:
          '「無聊的中間」是事業真正成形的地方。第 1 天是靈感、第 1000 天是身份。第 30 到第 300 天是沙漠。多數人在沙漠裡就放棄了。',
        insight:
          'adlo 過去一年累積的 50+ 篇 SEO 文章、8 支工具——絕大多數是沙漠期的產出，沒有單一篇爆紅、沒有單一支工具被瘋傳。但這些日復一日的小累積，疊到第 12 個月，新進對手要追平就得花掉同樣多的時間。寫第 1 篇 GBP 貼文時的心情，跟寫第 50 篇時的心情會完全不同，但你的客人只看得到第 50 篇之後的成果。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-29',
      },
      {
        id: 'w23-04',
        original: `"One viral post gets you new followers. 100 boring consistent posts gets you customers. The first feels better, the second pays better."`,
        translation:
          '1 篇 viral 貼文幫你拿新粉絲。100 篇無聊但持續的貼文幫你拿客人。第一種感覺比較爽，第二種比較賺。',
        insight:
          '店家最常做錯：花 8 小時做一支「希望會爆」的短影片，結果觸及只有 200。同樣 8 小時拆成 20 篇 GBP 貼文 + 20 則 LINE 推播 + 20 則 IG，半年後客人記得你是誰，自己找回來的。爆款是運氣，累積是技術。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-05-31',
      },
      {
        id: 'w23-05',
        original: `"Attention compounds like money. Spending 1 hour a day for 5 years on the same topic makes you irreplaceable. Spending 5 hours a day across 5 topics for 1 year makes you forgettable."`,
        translation:
          '注意力跟錢一樣會複利。一天花 1 小時、連續 5 年寫同一個主題，會讓你變成不可取代的人。一天花 5 小時、橫跨 5 個主題寫 1 年，會讓你變成被遺忘的人。',
        insight:
          '「我什麼都做：餐飲 + 文創 + 一日體驗 + 婚禮場地」——這種店半年內掉到沒人記得。「我只做台中西區、午餐、給上班族的便當」——這種店 3 年後不用打廣告。你的店越窄、越久、GBP 越活躍，才在「上班族 午餐 台中」這類搜尋裡站得住腳。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-01',
      },
      {
        id: 'w23-06',
        original: `"Patience is not waiting. Patience is doing the right thing for years without external validation. Most people can do it for 3 months. The ones who do it for 3 years become irreplaceable."`,
        translation:
          '耐心不是等待。耐心是在沒有外部認可的情況下，持續做對的事很多年。多數人能做 3 個月。能做 3 年的，會變成不可取代。',
        insight:
          '店家常被問「你開幾年了？」——5 年以下是「新開的」、10 年是「老店」、20 年是「在地必訪」。Google 地圖會自動把「資歷年數」當成排名訊號。下次有人問你開幾年了，不要輕描淡寫——那幾年是你花了真金白銀買來的排名訊號，比花錢買廣告位划算太多。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-02',
      },
      {
        id: 'w23-07',
        original: `"Year 1: 10 followers, no money. Year 2: 100 followers, $1k. Year 3: 1,000 followers, $10k. Most people quit before year 2. The compounding only kicks in for those who stay past the dip."`,
        translation:
          '第 1 年：10 個追蹤者、沒收入。第 2 年：100 個追蹤者、賺 1 千美元。第 3 年：1,000 個追蹤者、賺 1 萬美元。多數人在第 2 年前放棄。複利只發生在「撐過低谷」的人身上。',
        insight:
          '開店第 1 年燒錢、第 2 年損平、第 3 年開始賺。多數店家在第 2 年底收掉，因為「看不到複利曲線」——但這正是曲線即將上揚的點。第 3 年能不能熬到，現金流的帳要每季算清楚，不是靠感覺撐。設一個固定日期（例如每季最後一週），把現金跑道、應收帳款、固定支出全部對一次。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-03',
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     Issue #10  |  2026-W24  |  把學習的渴望變成事業入口——2026 年最不會過時的護城河
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w24',
    issueNumber: 10,
    theme: '把學習的渴望變成事業入口——2026 年最不會過時的護城河',
    publishedAt: '2026-06-11',
    summary:
      '本期聚焦 Dan Koe 6 月連續在談的核心命題：你對某件事的好奇心，才是 2026 年最抗 AI 替代的資產。從「Point B（你能帶客人到哪裡）」到「每天 2 小時 × 6 年 = 一人事業」，拆解台灣中小店家如何把「我懂這件事」變成客人願意付錢的服務。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80',
      alt: '翻開的書本特寫，書頁透著光，象徵持續學習的渴望',
      credit: 'Patrick Tomasso',
      creditUrl: 'https://unsplash.com/@impatrickt',
    },
    posts: [
      {
        id: 'w24-01',
        original: `"Most people think they need a product idea. What they actually need is a Point B. Where do you want to take someone? That's the business. The product is just the vehicle."`,
        translation:
          '多數人以為自己需要的是一個「產品想法」。他們真正需要的是一個「Point B」——你想把別人帶到哪裡？那才是事業本身。產品只是工具。',
        insight:
          '台灣店家常說「我有手藝，不知道怎麼做生意」——Dan Koe 的框架是：先想「你能幫客人從哪裡到哪裡？」（Point A → Point B）。咖啡師的 Point B：「讓客人下午有 15 分鐘的安靜」。律師的 Point B：「讓客人的繼承糾紛在 60 天內解決」。Point B 清楚了，定價、服務設計、GBP 描述全部跟著清楚。你的 Point B 是什麼？',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-09',
      },
      {
        id: 'w24-02',
        original: `"Your love of learning is a business model. Most people treat curiosity as a hobby. The few who treat it as infrastructure become irreplaceable. You already know what you're endlessly curious about."`,
        translation:
          '你對學習的渴望就是一個商業模式。多數人把好奇心當興趣，少數人把它當成基礎建設，這些人變得不可取代。你已經知道自己對什麼永遠充滿好奇。',
        insight:
          '台灣老一輩觀念：「學得多不如做得多」。Dan Koe 的反直覺：持續學習某個領域的人，會比「只做不學」的人累積出更深的護城河。一個深入研究台灣 GBP 演算法 3 年的顧問，比廣告投 100 萬的業者更難被取代。你今天花最多時間在學什麼？那個就是你的商業護城河的原料。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-10',
      },
      {
        id: 'w24-03',
        original: `"Writing is the skill that makes every other skill more valuable. You can be an excellent chef, therapist, or developer — but if you can write about what you do, your reach and rates multiply."`,
        translation:
          '寫作是讓所有其他技能都變更值錢的技能。你可以是很棒的廚師、治療師、工程師——但如果你能把你在做的事寫出來，你的影響力和收費能力都會倍增。',
        insight:
          '台灣老闆常說「我做的讓產品說話就好，不需要行銷」。Dan Koe 說的剛好相反：你的技術是 1，寫作是後面的 0。台中有個麵包師傅，每天早上在 IG 寫 3 句話說他為什麼選這種麵粉——6 個月後預購排到 3 週後，什麼廣告都沒投。寫作不是文人的事，是你讓客人「懂你為什麼值這個價格」的唯一方法。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-11',
      },
      {
        id: 'w24-04',
        original: `"One newsletter → one week of content. The ecosystem beats the algorithm. Stop feeding platforms. Start building your own distribution that no platform can take away."`,
        translation:
          '一篇 newsletter → 整週的內容。生態系勝過演算法。不要只餵內容給平台，開始建立沒有平台能奪走的自有傳播渠道。',
        insight:
          '台灣店家常問「IG 還是 Threads 還是 LINE？」——Dan Koe 的答案是：先有一個核心內容（一週的 GBP 貼文初稿、一篇部落格文章），再拆解成各平台版本。adlo GBP 貼文產生器的設計邏輯就是這個：7 篇出來，你可以貼 GBP、剪裁成 Threads 觀點文、濃縮成 LINE 推播。一次輸入，多平台輸出。演算法永遠在變，自有內容不會消失。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-12',
      },
      {
        id: 'w24-05',
        original: `"AI doesn't replace your curiosity. It amplifies it. The person who knows what to ask — and can recognize a good answer — will always outperform the person who just uses AI to generate."`,
        translation:
          'AI 不會取代你的好奇心，它放大好奇心。「知道問什麼問題、能判斷答案好不好」的人，永遠會跑贏「只是用 AI 生內容」的人。',
        insight:
          '2026 台灣很多老闆開始用 AI 寫貼文，結果大家的 GBP 描述、Threads 文、LINE 推播感覺都一樣——因為他們問的問題都一樣、用的 AI 都一樣。唯一的差異化回到你的「視角」：你在這個產業的獨特經驗、你看到的客人其他人沒注意到的事。AI 可以幫你把想法寫成句子，但想法本身沒有 AI 替你想。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-13',
      },
      {
        id: 'w24-06',
        original: `"Personal brand isn't about being famous. It's about being known by the right people for the right things. 1,000 people who trust you completely is worth more than 100,000 who vaguely know your name."`,
        translation:
          '個人品牌不是要出名，是要讓對的人因為對的事認識你。1,000 個完全信任你的人，比 100,000 個模糊知道你名字的人更值錢。',
        insight:
          '台灣 GBP 排名前 3 的店家，不見得有最多追蹤者，卻有最穩定的客人——因為對的 300 個人認識他們、信任他們、每個月回來。不要追蹤數，追「有多少人在你發文後 5 分鐘內回覆、或上個月回頭消費」。這 300 個人，才是你真正的個人品牌的體現。adlo 的評論收集工具幫你把這 300 人的聲音留在 Google——比 1 萬個粉絲有用。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-14',
      },
      {
        id: 'w24-07',
        original: `"The gap is widening. People who are experimenting with AI, learning how to write better, and building their own platforms today — they are compounding at a rate that feels invisible until it isn't. By the end of 2026, it will be obvious who started in 2024."`,
        translation:
          '差距正在擴大。現在在用 AI 做實驗、學習寫作、建立自己傳播渠道的人——他們正在以一種「看不出來、直到突然很明顯」的速度複利。2026 年底，就能看出誰在 2024 年開始動了。',
        insight:
          '對台灣中小店家：今天開始每週更新 GBP 的店，2026 年底在同區搜尋的排名，會跟今天才要開始的店拉開肉眼可見的差距。差距不是一夜之間顯現，是某天突然「對手怎麼這麼多評論、這麼多內容」——但那個差距早在 6 個月前就開始了。你能控制的只有：今天動還是下週再說。',
        xUrl: 'https://x.com/thedankoe',
        postedAt: '2026-06-15',
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────
     Issue #11  |  2026-W29  |  不要找利基，開一條窄道
  ───────────────────────────────────────────────────────────── */
  {
    week: '2026-w29',
    issueNumber: 11,
    theme: '不要找利基，開一條窄道——你就是那個市場',
    publishedAt: '2026-07-14',
    summary:
      '第 8 期談過「窄到變成必選」，這期進一步：Dan Koe 其實反對硬擠進別人定義好的小框框。他主張 niche of one——自己開一條窄道，讓你成為那條道上唯一的人。本期 5 篇原文加一個可查證的收入案例：一份只有 1,000 訂閱者的 newsletter，如何做到年營收百萬美元。建立一條窄道市場，你的成功會容易許多。',
    coverImage: {
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80',
      alt: '陽光穿過森林中一條窄窄的小徑——象徵自己開出來的窄道市場',
      credit: 'Lukasz Szmigiel',
      creditUrl: 'https://unsplash.com/@szmigieldesign',
    },
    posts: [
      {
        id: 'w29-01',
        original: `"Niche down." The words that cause too many people to quit their dream of doing their own thing. Let's change that. How to create your niche of one (by being yourself):`,
        translation:
          '「利基化。」這三個字讓太多人放棄了做自己事業的夢想。我們來改變這件事。如何建立你的「一人利基」（做你自己）：',
        insight:
          '「你要選一個利基」這句創業建議，讓很多台灣老闆卡死：賣雞排的想「我的利基是什麼？」想了三年還在原地。Dan Koe 說反了才對——不是去找一個現成的小市場塞進去，是把「你這家店獨有的組合」變成一條別人進不來的窄道。你的地點＋你的手藝＋你堅持的細節，這個組合全台中只有你有。',
        xUrl: 'https://x.com/thedankoe/status/1845096755295117697',
        postedAt: '2024-10-12',
      },
      {
        id: 'w29-02',
        original: `The most difficult part is "finding your niche." And to that I say: Don't find a niche, you are the niche.`,
        translation:
          '最難的部分是「找到你的利基」。對此我想說：不要去找利基，你就是利基。',
        insight:
          '台灣店家最常見的焦慮：「隔壁也是做這個的，我要怎麼差異化？」答案不在產品表上，在你身上。同樣賣越南河粉，一個「嫁來台灣 20 年的越南媽媽親自熬湯」的故事，是任何競爭對手都抄不走的窄道。把老闆是誰、為什麼開這家店寫進 Google 商家介紹——那是你唯一不會被比價的資產。',
        xUrl: 'https://x.com/thedankoe/status/1622215481410068481',
        postedAt: '2023-02-05',
      },
      {
        id: 'w29-03',
        original: `1) The most profitable niche is you. The first thing you'll hear when you want to start a business is to "choose a niche." You do this by: - Choosing a market - Narrowing to a sub market - Creating a customer avatar - Identifying their problems. Then, you build a solution.`,
        translation:
          '最賺錢的利基就是你。想創業時你聽到的第一句話一定是「選一個利基」。做法是：選一個市場 → 縮小到子市場 → 建立客戶輪廓 → 找出他們的問題。然後，你打造解決方案。',
        insight:
          '注意 Dan Koe 這裡列的傳統流程：市場 → 子市場 → 客戶輪廓 → 問題 → 解方。多數台灣店家連第一步都沒做過，直接開店然後等客人。倒著做一次：你現在最好的 5 個客人是誰？他們共同的問題是什麼？答案就是你該全力經營的子市場。這比任何廣告投放都便宜，而且做一次受用好幾年。',
        xUrl: 'https://x.com/thedankoe/status/1653356165751795721',
        postedAt: '2023-05-02',
      },
      {
        id: 'w29-04',
        original: `Don't find a niche. Create one.`,
        translation: '不要找利基。創造一個。',
        insight:
          '「找利基」是在別人畫好的地圖上搶位置；「創造利基」是自己畫地圖。台灣的在地服務業有一個天然優勢：地理範圍本身就是窄道的圍欄。「台中南屯、專接雙薪家庭的到府收送洗衣」——這個類別在你成立它之前不存在，你成立它的那天，你就是第一名，也是唯一一名。窄道市場的成功之所以容易，是因為你不用贏過任何人，你只要被對的人找到。',
        xUrl: 'https://x.com/thedankoe/status/1772614520579514496',
        postedAt: '2024-03-26',
      },
      {
        id: 'w29-05',
        original: `To recap: - You are the niche - Vision over target audience - Content ecosystems over funnels - Create a world for people to explore`,
        translation:
          '總結：一、你就是利基。二、願景重於目標受眾。三、內容生態系重於行銷漏斗。四、創造一個讓人想探索的世界。',
        insight:
          '「創造一個讓人探索的世界」聽起來很抽象，落地到台灣店家其實很具體：你的 Google 商家檔案就是那個世界的入口。照片牆是世界觀、貼文是連載、評論回覆是你和住民的對話。窄道市場不是把店做小，是把世界做深。最後給一個可查證的收入證明：Nathan May（The Feed Media）把 newsletter 設成邀請制、訂閱者只有約 1,000–1,500 人，卻在約 10 個半月做到年營收一百萬美元——因為他算過，他真正想服務的市場全世界只有 600 個人（300 家公司 × 2 個決策者），而沒有第二個人專門對這 600 人說話。你商圈 3 公里內對的那幾百個人，就是你的 600 人。精準解決一個窄問題，就會有人買單。（案例來源：Growth in Reverse 專訪 Nathan May，2025）',
        xUrl: 'https://x.com/thedankoe/status/1845096839596441822',
        postedAt: '2024-10-12',
      },
    ],
  },
];

export function getAllIssues(): DanKoeIssue[] {
  return [...danKoeIssues].sort((a, b) => b.issueNumber - a.issueNumber);
}

export function getIssueByWeek(week: string): DanKoeIssue | undefined {
  return danKoeIssues.find(i => i.week === week);
}

export function getAdjacentIssues(week: string): {
  prev: DanKoeIssue | null;
  next: DanKoeIssue | null;
} {
  const sorted = [...danKoeIssues].sort((a, b) => a.issueNumber - b.issueNumber);
  const idx = sorted.findIndex(i => i.week === week);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}
