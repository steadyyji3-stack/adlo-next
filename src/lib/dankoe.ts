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
