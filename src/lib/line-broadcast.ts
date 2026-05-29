/**
 * /tools/line-broadcast 核心邏輯
 *
 * 用途：輸入店名 + 產業 + 本週主題，產出 7 天 LINE OA 推播文案初稿。
 *
 * 純 deterministic template，不打外部 AI API → 零成本、無速率限制、無 cost-cap。
 *
 * 設計原則：
 * - 每篇推播 60-180 字（LINE OA 推播甜蜜點，太短沒重點、太長被當廣告）
 * - 7 篇分類：歡迎/教育/QA/幕後/新品/促銷/節慶（與 GBP post-writer 平行）
 * - 每篇附建議推播時段 + 1-3 個建議 emoji
 * - 推播紅線提示（避免封鎖率上升）
 */

export type LineCategory =
  | '歡迎'
  | '教育'
  | 'QA'
  | '幕後'
  | '新品'
  | '促銷'
  | '節慶';

export type LineIndustry =
  | '餐飲'
  | '美髮美容'
  | '醫美'
  | '牙科'
  | '律師'
  | '補教'
  | '零售'
  | '其他';

export interface LineBroadcastInput {
  storeName: string;
  industry: LineIndustry;
  weekTheme?: string;
}

export interface GeneratedBroadcast {
  day: string; // 週一 / 週二 / ...
  category: LineCategory;
  title: string; // 內部標籤，不會推播
  message: string; // 實際推播內容
  bestTime: string; // 建議推播時段
  emoji: string; // 建議 1-3 個 emoji
  characterCount: number; // 字數（供使用者參考）
}

/** 產業專屬語感詞 */
const industryFlavor: Record<
  LineIndustry,
  { craft: string; signature: string; verb: string; pain: string }
> = {
  餐飲: {
    craft: '備料',
    signature: '一道湯一道菜',
    verb: '吃',
    pain: '不知道今晚吃什麼',
  },
  美髮美容: {
    craft: '洗剪吹',
    signature: '一頭好髮',
    verb: '剪',
    pain: '頭髮卡在尷尬長度',
  },
  醫美: {
    craft: '療程設計',
    signature: '一張自然臉',
    verb: '做',
    pain: '想改善但怕看起來不自然',
  },
  牙科: {
    craft: '蛀牙修補',
    signature: '一口好牙',
    verb: '檢查',
    pain: '怕看牙醫又不敢拖',
  },
  律師: {
    craft: '訴狀草擬',
    signature: '一份穩的合約',
    verb: '看',
    pain: '不知道找誰問',
  },
  補教: {
    craft: '教案設計',
    signature: '一堂課的細節',
    verb: '上',
    pain: '進度跟不上',
  },
  零售: {
    craft: '選品',
    signature: '一件耐用的東西',
    verb: '挑',
    pain: '東西不知道在哪買',
  },
  其他: {
    craft: '日常工作',
    signature: '一份用心做的服務',
    verb: '體驗',
    pain: '找不到合適的對象',
  },
};

/** 推薦推播時段（依台灣 LINE 流量高峰） */
const RECOMMENDED_TIMES = {
  morning: '早上 8:00 - 9:00',
  noon: '中午 12:00 - 13:00',
  evening: '晚上 20:30 - 22:00',
} as const;

/**
 * 產出 7 天 LINE 推播草稿。Deterministic — 同樣 input 同樣 output。
 */
export function generateBroadcasts(input: LineBroadcastInput): GeneratedBroadcast[] {
  const name = input.storeName.trim() || '我們';
  const theme = input.weekTheme?.trim() || '';
  const f = industryFlavor[input.industry] ?? industryFlavor['其他'];

  const themeLine = theme ? `本週主題：${theme}` : '';

  const drafts: Omit<GeneratedBroadcast, 'characterCount'>[] = [
    {
      day: '週一',
      category: '歡迎',
      title: '一週開頭：軟性問候 + 本週預告',
      message: theme
        ? `週一早安☀️\n\n這週 ${name} 主要在做 ${theme}。\n會陸續分享一些幕後、實作細節，跟你說說我們在想什麼。\n\n不會每天都推播，挑重要的講。`
        : `週一早安☀️\n\n${name} 這週主要在「${f.craft}」這件事上花時間。\n會挑 2-3 個重點跟你分享，不會每天都推播。\n\n如果有想看的內容，回 LINE 跟我們說。`,
      bestTime: RECOMMENDED_TIMES.morning,
      emoji: '☀️ 📋',
    },
    {
      day: '週二',
      category: '教育',
      title: '小知識 / 觀念釐清',
      message: `多數人在「${f.verb}${f.signature}」這件事上，常踩到的一個坑——\n\n以為「越貴 = 越好」，但事實是「適合 = 最好」。\n\n${name} 想分享一個簡單判斷：先想清楚你「為什麼要這個」，再看價格。順序對了，預算就不會浪費。\n\n下次有空跟你拆得更細。${themeLine ? '\n\n' + themeLine : ''}`,
      bestTime: RECOMMENDED_TIMES.evening,
      emoji: '💡 📝',
    },
    {
      day: '週三',
      category: 'QA',
      title: '常見問題回答',
      message: `常被問：「${f.pain}怎麼辦？」\n\n${name} 的答案是——先把問題拆細：\n1) 它什麼時候開始的？\n2) 你已經試過什麼？\n3) 預算/時間範圍多少？\n\n3 個問題回答完，多數情況答案會自己浮出來。\n\n還是想不通可以直接問我們，免費。`,
      bestTime: RECOMMENDED_TIMES.noon,
      emoji: '❓ 💬',
    },
    {
      day: '週四',
      category: '幕後',
      title: '營業日常 / 製程紀錄',
      message: `這禮拜在「${f.craft}」時想到一件事——\n\n做久了會發現，最費時間的不是技術，是「跟客人講清楚我們在做什麼」。\n\n${name} 最近練習：少用專業詞、多用比喻。客人聽得懂，後續溝通成本反而降很多。\n\n你最近也遇到「想說但講不清楚」的場景嗎？回我們聊聊。`,
      bestTime: RECOMMENDED_TIMES.evening,
      emoji: '🛠️ 🧠',
    },
    {
      day: '週五',
      category: '新品',
      title: '新品 / 新方案介紹',
      message: theme
        ? `${name} 這週推出跟「${theme}」相關的新內容/新方案 🎉\n\n為什麼做這個：我們發現很多客人在這個情境卡住，但市面上沒有合適的選項。\n\n細節已經放在我們的 LINE 圖文選單裡，週末可以慢慢看。\n\n有問題直接回，不用客氣。`
        : `${name} 這禮拜更新了一個新東西 🎉\n\n簡單講：把以前要花 30 分鐘解釋的服務，做成「3 分鐘就能評估適不適合」的版本。\n\n細節在 LINE 圖文選單。週末有空可以看看，有問題直接回我們。`,
      bestTime: RECOMMENDED_TIMES.noon,
      emoji: '🎉 ✨',
    },
    {
      day: '週六',
      category: '促銷',
      title: '溫和促銷（避免推銷感）',
      message: `週末了，${name} 想跟長期支持的 LINE 好友說聲謝謝 🙏\n\n這個月底前，憑這則 LINE 預約/購買，會多送一個小心意（不公開、只給 LINE 好友）。\n\n不是清庫存，是想多認識一些常聯絡的客人。\n\n要的話直接回「我要」，我們會跟你約時間。`,
      bestTime: RECOMMENDED_TIMES.morning,
      emoji: '🎁 🙏',
    },
    {
      day: '週日',
      category: '節慶',
      title: '週末總結 / 軟性節慶問候',
      message: `週日晚安🌙\n\n這禮拜${theme ? `做了 ${theme}` : '把該做的事都做完了'}，比想像中累，但也比想像中踏實。\n\n${name} 想說：謝謝這個月願意把 LINE 留著的你。\n\n下週見。\n\nP.S. 如果這週有什麼想聊的，隨時回。我們不會自動回機器人話。`,
      bestTime: RECOMMENDED_TIMES.evening,
      emoji: '🌙 💚',
    },
  ];

  return drafts.map((d) => ({
    ...d,
    characterCount: d.message.replace(/\s/g, '').length,
  }));
}

/** LINE 推播紅線（避免封鎖率上升） */
export interface LineRedline {
  rule: string;
  why: string;
  example: string;
}

export const LINE_REDLINES: LineRedline[] = [
  {
    rule: '不要連續 3 天都推促銷',
    why: '客人收到第 3 則「限時優惠」會直接封鎖。LINE 封鎖率是 OA 評分的核心指標。',
    example: '❌ 連續 3 天「特價」「最後 1 天」「再不買沒了」\n✅ 教育 → 幕後 → 促銷，中間插非銷售內容',
  },
  {
    rule: '推播時間避開深夜與清晨',
    why: '00:00 - 07:00 推播 = 吵到客人睡眠 = 封鎖率高。',
    example: '❌ 凌晨 1 點推「新品上架」\n✅ 早 8-9 / 中午 12-13 / 晚 20:30-22:00',
  },
  {
    rule: '一週推播 ≤ 3 次',
    why: 'LINE 官方建議每週 2-3 則推播。超過會被視為「過度行銷」。',
    example: '❌ 每天 1 則\n✅ 一週挑 2-3 個重點時段推',
  },
  {
    rule: '訊息不要全部都連結',
    why: '純連結 + 「點我」= LINE 演算法會降低觸及。',
    example: '❌「最新優惠 → https://...」\n✅ 有起承轉合的文字 + 1 個 CTA 連結',
  },
  {
    rule: '不要用「親愛的好朋友」等罐頭開頭',
    why: '客人一秒就分辨「這是群發」→ 直接滑掉。',
    example: '❌「親愛的好朋友您好～」\n✅「週一早安☀️」「常被問的一個問題：」',
  },
  {
    rule: '避免使用過多驚嘆號與全大寫',
    why: '「！！！」「優惠 SAVE NOW」這種風格在台灣會被當成詐騙。',
    example: '❌「優惠！！！只剩 3 個名額！！」\n✅「這個月底前 LINE 好友獨享」',
  },
];

/** LINE OA 推播額度提示（依方案）  */
export const LINE_PLAN_HINTS = [
  {
    plan: '免費',
    monthlyMessages: 200,
    note: '200 則/月，超過就停推。適合好友 200 以下、低頻推播。',
  },
  {
    plan: '輕用量',
    monthlyMessages: 4000,
    note: 'NT$1,150/月，4,000 則。好友 200-1,300 推 2-3 次/週很夠用。',
  },
  {
    plan: '中用量',
    monthlyMessages: 25000,
    note: 'NT$5,000/月，25,000 則。好友 1,000+ 才需要。',
  },
];
