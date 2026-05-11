// Path C：mock data。後續接 Google Ads Keyword Planner API 後此檔可廢棄。
// 數據用 stable hash 確保「同一關鍵字一律給同一結果」（便於 demo + 截圖）

export type Recommendation =
  | 'strong-seo' // 強推 SEO
  | 'ads-and-seo' // 廣告 + 長期 SEO
  | 'ads-only' // 廣告試試
  | 'longtail-seo' // 長尾 SEO 機會
  | 'skip'; // 太冷門，跳過

export interface KeywordResult {
  keyword: string;
  monthlySearches: number;
  difficulty: number; // 0-100
  cpcNtd: number; // NT$
  recommendation: Recommendation;
  insight: string;
}

export interface KeywordInput {
  keywords: string[]; // up to 10
}

// 高 CPC 產業關鍵詞偵測
const HIGH_CPC_INDUSTRIES = [
  '植牙', '矯正', '牙醫', '律師', '醫美', '雙眼皮', '隆鼻', '脂肪',
  '保險', '貸款', '理財', '會計', '記帳', '稅務', '徵信',
  '搬家', '清潔', '裝潢', '室內設計',
];
const LOW_CPC_INDUSTRIES = [
  '早餐', '午餐', '晚餐', '咖啡', '甜點', '飲料', '小吃',
  '剪髮', '美甲', '美睫', '按摩', 'spa',
];

// 高競爭副詞（推升難度）
const HIGH_DIFFICULTY_MODIFIERS = ['便宜', '推薦', '評價', 'ptt', '比較', '價格', '費用'];
// 在地修飾詞（降難度，因長尾）
const LOCAL_MODIFIERS = ['台北', '新北', '桃園', '台中', '台南', '高雄', '新竹', '基隆', '彰化', '嘉義', '東區', '西區', '南區', '北區', '中區'];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function calculateMonthlySearches(kw: string, rand: () => number): number {
  const len = kw.length;
  const hasLocal = LOCAL_MODIFIERS.some((m) => kw.includes(m));

  // 短字 + 無地區 = 高搜尋
  // 長尾 + 有地區 = 中低搜尋
  let base: number;
  if (len <= 4 && !hasLocal) base = 8000 + rand() * 22000;
  else if (len <= 4) base = 1200 + rand() * 3800;
  else if (len <= 8 && !hasLocal) base = 2000 + rand() * 8000;
  else if (len <= 8) base = 400 + rand() * 1600;
  else if (len <= 12) base = 150 + rand() * 850;
  else base = 30 + rand() * 220;

  // 大量隨機誤差後 round 到「人會看的數字」
  const rounded = Math.round(base / 10) * 10;
  return rounded;
}

function calculateDifficulty(kw: string, rand: () => number): number {
  let diff = 30 + rand() * 30; // base 30-60

  // 高競爭副詞推升
  for (const mod of HIGH_DIFFICULTY_MODIFIERS) {
    if (kw.includes(mod)) {
      diff += 12;
      break;
    }
  }
  // 高 CPC 產業推升
  for (const ind of HIGH_CPC_INDUSTRIES) {
    if (kw.includes(ind)) {
      diff += 10;
      break;
    }
  }
  // 在地修飾降低
  for (const loc of LOCAL_MODIFIERS) {
    if (kw.includes(loc)) {
      diff -= 8;
      break;
    }
  }
  // 字數越長越長尾、越好做
  if (kw.length >= 10) diff -= 5;
  if (kw.length >= 14) diff -= 6;

  return Math.max(8, Math.min(95, Math.round(diff)));
}

function calculateCPC(kw: string, rand: () => number): number {
  // base 隨機
  let cpc = 8 + rand() * 22;

  // 高 CPC 產業放大
  for (const ind of HIGH_CPC_INDUSTRIES) {
    if (kw.includes(ind)) {
      cpc = 60 + rand() * 140; // NT$60-200
      break;
    }
  }
  // 低 CPC 產業壓縮
  for (const ind of LOW_CPC_INDUSTRIES) {
    if (kw.includes(ind)) {
      cpc = 5 + rand() * 18;
      break;
    }
  }
  // 商業意圖修飾推升
  if (HIGH_DIFFICULTY_MODIFIERS.some((m) => kw.includes(m))) {
    cpc *= 1.4;
  }

  return Math.round(cpc);
}

function decideRecommendation(
  searches: number,
  difficulty: number,
  cpc: number,
): { recommendation: Recommendation; insight: string } {
  if (searches < 100) {
    return {
      recommendation: 'skip',
      insight: '搜尋量太低，投資 SEO 或廣告都不划算。換更主流的字試試。',
    };
  }
  if (difficulty < 45 && searches >= 500) {
    return {
      recommendation: 'strong-seo',
      insight: '低難度 + 不錯的量。優先做 SEO，3-6 個月內可衝到前 3 名。',
    };
  }
  if (difficulty >= 70 && cpc >= 60) {
    return {
      recommendation: 'ads-and-seo',
      insight: '高競爭高單價字。短期跑廣告搶單，長期慢慢做 SEO 降廣告依賴。',
    };
  }
  if (difficulty >= 65 && cpc < 40) {
    return {
      recommendation: 'ads-only',
      insight: 'SEO 很難但 CPC 不貴。跑小預算廣告（NT$5,000/月）測試轉換。',
    };
  }
  if (searches < 500 && difficulty < 50) {
    return {
      recommendation: 'longtail-seo',
      insight: '長尾字、容易做。寫 1 篇 1,500 字部落格文章鎖定它就行。',
    };
  }
  return {
    recommendation: 'ads-only',
    insight: '中等競爭、適合用廣告試水溫。觀察 2 週轉換率再決定要不要做 SEO。',
  };
}

export function mockAnalyzeKeywords(input: KeywordInput): KeywordResult[] {
  return input.keywords.map((kw) => {
    const seed = hash(kw.trim().toLowerCase());
    const rand = mulberry32(seed);

    const monthlySearches = calculateMonthlySearches(kw, rand);
    const difficulty = calculateDifficulty(kw, rand);
    const cpcNtd = calculateCPC(kw, rand);
    const { recommendation, insight } = decideRecommendation(
      monthlySearches,
      difficulty,
      cpcNtd,
    );

    return {
      keyword: kw,
      monthlySearches,
      difficulty,
      cpcNtd,
      recommendation,
      insight,
    };
  });
}

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  'strong-seo': '🔥 強推 SEO',
  'ads-and-seo': '💪 廣告 + 長期 SEO',
  'ads-only': '🎯 跑廣告試試',
  'longtail-seo': '✏️ 長尾 SEO 機會',
  'skip': '⏭️ 跳過',
};

export const RECOMMENDATION_TONE: Record<Recommendation, string> = {
  'strong-seo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'ads-and-seo': 'bg-blue-50 text-blue-700 border-blue-200',
  'ads-only': 'bg-amber-50 text-amber-700 border-amber-200',
  'longtail-seo': 'bg-violet-50 text-violet-700 border-violet-200',
  'skip': 'bg-slate-100 text-slate-500 border-slate-200',
};
