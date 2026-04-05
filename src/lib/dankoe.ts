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
     Issue #2  →  下期預告位（敬請期待 2026-W15）
  ───────────────────────────────────────────────────────────── */
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
