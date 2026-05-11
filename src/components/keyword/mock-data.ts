// 「相對等級」版本（2026-05-12 緊急改動）
//
// 為什麼改？前一版顯示具體數字（如「月搜尋 2,400」「CPC NT$38」），但這些
// 數字是 hash + 啟發式估算，不是 Google Ads 真實數據。投手上 Ads 帳戶會查
// 到完全不同的數字，會嚴重打擊 adlo 信譽。
//
// 解法：不顯示具體數字，改顯示「等級」（低/中/高），加上邏輯依據說明。
// 等級是「相對判斷」，即使跟 Ads 真實數字不完全一致，也不會被當作精準誤導。
//
// 真實數字請用 Google Ads Keyword Planner（結果頁底部直連）。

export type Band = 'very-low' | 'low' | 'mid' | 'high' | 'very-high';
export type CpcBand = 'low' | 'mid' | 'high';

export type Recommendation =
  | 'strong-seo'
  | 'ads-and-seo'
  | 'ads-only'
  | 'longtail-seo'
  | 'skip';

export interface KeywordResult {
  keyword: string;
  searchVolumeBand: Band;
  searchVolumeReasons: string[]; // 為什麼判斷這個等級
  difficulty: number; // 0-100（相對評分）
  difficultyReasons: string[];
  cpcBand: CpcBand;
  cpcReasons: string[];
  recommendation: Recommendation;
  insight: string;
}

export interface KeywordInput {
  keywords: string[];
}

const HIGH_CPC_INDUSTRIES = [
  '植牙', '矯正', '牙醫', '律師', '醫美', '雙眼皮', '隆鼻', '脂肪',
  '保險', '貸款', '理財', '會計', '記帳', '稅務', '徵信',
  '搬家', '清潔', '裝潢', '室內設計',
];
const LOW_CPC_INDUSTRIES = [
  '早餐', '午餐', '晚餐', '咖啡', '甜點', '飲料', '小吃',
  '剪髮', '美甲', '美睫', '按摩', 'spa',
];
const HIGH_DIFFICULTY_MODIFIERS = ['便宜', '推薦', '評價', 'ptt', '比較', '價格', '費用'];
const LOCAL_MODIFIERS = [
  '台北', '新北', '桃園', '台中', '台南', '高雄', '新竹', '基隆', '彰化', '嘉義',
  '東區', '西區', '南區', '北區', '中區',
];

function findMatched(kw: string, list: string[]): string | null {
  for (const m of list) {
    if (kw.includes(m)) return m;
  }
  return null;
}

function judgeSearchVolume(kw: string): { band: Band; reasons: string[] } {
  const reasons: string[] = [];
  const len = kw.length;
  const localMatch = findMatched(kw, LOCAL_MODIFIERS);

  // 字數 + 在地修飾綜合判斷（這是「相對」邏輯，不是查 Google）
  if (len <= 4 && !localMatch) {
    reasons.push('短字、無地區限定 → 通常是高流量主類詞');
    return { band: 'very-high', reasons };
  }
  if (len <= 4 && localMatch) {
    reasons.push(`含在地修飾「${localMatch}」→ 流量被切到局部市場`);
    return { band: 'high', reasons };
  }
  if (len <= 8 && !localMatch) {
    reasons.push('中長度、無地區 → 一般類詞，流量中上');
    return { band: 'high', reasons };
  }
  if (len <= 8 && localMatch) {
    reasons.push(`含在地修飾「${localMatch}」+ 中字長 → 長尾流量`);
    return { band: 'mid', reasons };
  }
  if (len <= 12) {
    reasons.push('長字組合 → 通常是具體意圖、流量偏低但意圖強');
    return { band: 'low', reasons };
  }
  reasons.push('超長字組合 → 極長尾，流量很低但客戶意圖明確');
  return { band: 'very-low', reasons };
}

function judgeDifficulty(kw: string): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let diff = 45; // base

  const competitiveMod = findMatched(kw, HIGH_DIFFICULTY_MODIFIERS);
  if (competitiveMod) {
    diff += 15;
    reasons.push(`含商業意圖修飾「${competitiveMod}」→ 大家都在搶`);
  }
  const industry = findMatched(kw, HIGH_CPC_INDUSTRIES);
  if (industry) {
    diff += 12;
    reasons.push(`含高競爭產業「${industry}」→ 多家業者長期投入`);
  }
  const localMatch = findMatched(kw, LOCAL_MODIFIERS);
  if (localMatch) {
    diff -= 10;
    reasons.push(`含在地修飾「${localMatch}」→ 對手範圍縮小、易做`);
  }
  if (kw.length >= 10) {
    diff -= 8;
    reasons.push('字長 ≥ 10 → 長尾字，競爭低');
  }

  if (reasons.length === 0) {
    reasons.push('一般競爭強度，無明顯加減項');
  }

  return { score: Math.max(15, Math.min(95, Math.round(diff))), reasons };
}

function judgeCpc(kw: string): { band: CpcBand; reasons: string[] } {
  const reasons: string[] = [];

  const highIndustry = findMatched(kw, HIGH_CPC_INDUSTRIES);
  if (highIndustry) {
    reasons.push(`含高 CPC 產業「${highIndustry}」→ 1 個客戶利潤高，業者願意出高價`);
    return { band: 'high', reasons };
  }

  const lowIndustry = findMatched(kw, LOW_CPC_INDUSTRIES);
  if (lowIndustry) {
    reasons.push(`含低 CPC 產業「${lowIndustry}」→ 客單價低、廣告出價空間有限`);
    return { band: 'low', reasons };
  }

  const intentMod = findMatched(kw, HIGH_DIFFICULTY_MODIFIERS);
  if (intentMod) {
    reasons.push(`含商業意圖修飾「${intentMod}」→ 出價競爭中等偏高`);
    return { band: 'mid', reasons };
  }

  reasons.push('一般類詞 → CPC 中等');
  return { band: 'mid', reasons };
}

function decideRecommendation(
  volume: Band,
  difficulty: number,
  cpc: CpcBand,
): { recommendation: Recommendation; insight: string } {
  // 量太低 → 跳過
  if (volume === 'very-low') {
    return {
      recommendation: 'skip',
      insight: '搜尋量太低，投資 SEO 或廣告都不划算。換更主流的字試試。',
    };
  }

  // 高量低難度 → 強推 SEO
  if (difficulty < 45 && (volume === 'mid' || volume === 'high' || volume === 'very-high')) {
    return {
      recommendation: 'strong-seo',
      insight: '低難度 + 不錯的量。優先做 SEO，3-6 個月內可衝到前 3 名。',
    };
  }

  // 高難度高 CPC → 雙策略
  if (difficulty >= 70 && cpc === 'high') {
    return {
      recommendation: 'ads-and-seo',
      insight: '高競爭高單價字。短期跑廣告搶單，長期慢慢做 SEO 降廣告依賴。',
    };
  }

  // 高難度低 CPC → 廣告試
  if (difficulty >= 65 && cpc === 'low') {
    return {
      recommendation: 'ads-only',
      insight: 'SEO 很難但 CPC 不貴。跑小預算廣告（NT$5,000/月）測試轉換。',
    };
  }

  // 量低難度低 → 長尾
  if (volume === 'low' && difficulty < 50) {
    return {
      recommendation: 'longtail-seo',
      insight: '長尾字、容易做。寫 1 篇 1,500 字部落格文章鎖定它就行。',
    };
  }

  // 中等情境
  return {
    recommendation: 'ads-only',
    insight: '中等競爭、適合用廣告試水溫。觀察 2 週轉換率再決定要不要做 SEO。',
  };
}

export function mockAnalyzeKeywords(input: KeywordInput): KeywordResult[] {
  return input.keywords.map((kw) => {
    const trimmed = kw.trim();
    const v = judgeSearchVolume(trimmed);
    const d = judgeDifficulty(trimmed);
    const c = judgeCpc(trimmed);
    const { recommendation, insight } = decideRecommendation(
      v.band,
      d.score,
      c.band,
    );

    return {
      keyword: trimmed,
      searchVolumeBand: v.band,
      searchVolumeReasons: v.reasons,
      difficulty: d.score,
      difficultyReasons: d.reasons,
      cpcBand: c.band,
      cpcReasons: c.reasons,
      recommendation,
      insight,
    };
  });
}

// ── Display helpers ──────────────────────────────

export const VOLUME_LABEL: Record<Band, string> = {
  'very-low': '極冷門',
  low: '冷門',
  mid: '中等',
  high: '熱門',
  'very-high': '極熱門',
};

export const VOLUME_TONE: Record<Band, string> = {
  'very-low': 'bg-slate-100 text-slate-500',
  low: 'bg-slate-50 text-slate-600',
  mid: 'bg-amber-50 text-amber-700',
  high: 'bg-emerald-50 text-emerald-700',
  'very-high': 'bg-emerald-100 text-emerald-800',
};

export const CPC_LABEL: Record<CpcBand, string> = {
  low: '低',
  mid: '中',
  high: '高',
};

export const CPC_TONE: Record<CpcBand, string> = {
  low: 'bg-slate-50 text-slate-600',
  mid: 'bg-amber-50 text-amber-700',
  high: 'bg-rose-50 text-rose-700',
};

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
