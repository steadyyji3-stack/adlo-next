// 關鍵字工具 v2（2026-05-12 擴充版）
//
// 改進方向：
// 1. 擴充判斷分類：產業詞 / 季節性 / 品牌詞 / 資訊型 vs 商業型
// 2. 新增 3 種建議：brand-defense / info-seo / local-domination
// 3. 同義詞 / 相關長尾建議
//
// 仍維持「相對等級 + 判斷依據」原則（避免假具體數字）。
// 真實數字一律導向 Google Ads Keyword Planner。

export type Band = 'very-low' | 'low' | 'mid' | 'high' | 'very-high';
export type CpcBand = 'low' | 'mid' | 'high';

export type Recommendation =
  | 'strong-seo'        // 主流字、難度可接受 → 強推 SEO
  | 'ads-and-seo'       // 高競爭高 CPC → 雙策略
  | 'ads-only'          // SEO 難但 CPC 可接受 → 廣告試
  | 'longtail-seo'      // 長尾字、容易做 → 寫一篇 blog
  | 'brand-defense'     // 品牌詞 → 防禦守
  | 'info-seo'          // 資訊型查詢 → 寫教學文
  | 'local-domination'  // 在地組合 → 重點投入
  | 'seasonal-burst'    // 季節性 → 短期主打
  | 'skip';             // 太冷門 → 跳過

export type KeywordType = '商業型' | '資訊型' | '品牌詞' | '在地服務' | '季節性' | '通用';

export interface KeywordResult {
  keyword: string;
  type: KeywordType;
  searchVolumeBand: Band;
  searchVolumeReasons: string[];
  difficulty: number;
  difficultyReasons: string[];
  cpcBand: CpcBand;
  cpcReasons: string[];
  recommendation: Recommendation;
  insight: string;
  /** 同義詞 / 變體（值得也分析的字）*/
  synonyms: string[];
  /** 相關長尾（從這個字延伸出的低難度長尾機會）*/
  longTails: string[];
}

export interface KeywordInput {
  keywords: string[];
}

// ─────────────────────────────────────────────────────
// 產業 / 修飾詞 字典
// ─────────────────────────────────────────────────────
const HIGH_CPC_INDUSTRIES = [
  '植牙', '矯正', '牙醫', '律師', '醫美', '雙眼皮', '隆鼻', '脂肪', '抽脂',
  '保險', '貸款', '理財', '會計', '記帳', '稅務', '徵信',
  '搬家', '清潔', '裝潢', '室內設計',
  '婚紗', '婚禮', '婚顧',
  '房地產', '租屋', '買房', '預售屋',
  '補習', '家教', '線上課程',
];

const LOW_CPC_INDUSTRIES = [
  '早餐', '午餐', '晚餐', '咖啡', '甜點', '飲料', '小吃', '便當',
  '剪髮', '美甲', '美睫', '按摩', 'spa',
  '寵物', '狗狗', '貓咪',
];

const MID_CPC_INDUSTRIES = [
  '健身', '瑜伽', '游泳', '皮拉提斯',
  '設計', '攝影', '婚攝',
  '軟體', 'crm', 'erp',
  '旅遊', '行程', '民宿', '飯店',
];

// 商業意圖（推升 SEO 難度、CPC、商業性）
const COMMERCIAL_MODIFIERS = ['推薦', '評價', 'ptt', '比較', '價格', '費用', '便宜', '哪家好', '優惠', '折扣'];

// 資訊型查詢（用戶在學東西，不一定要買）
const INFO_MODIFIERS = ['是什麼', '怎麼', '如何', '教學', '步驟', '方法', '原因', '注意事項', '差別', '影響'];

// 在地修飾
const LOCAL_MODIFIERS = [
  '台北', '新北', '桃園', '台中', '台南', '高雄', '新竹', '基隆', '彰化', '嘉義',
  '宜蘭', '花蓮', '台東', '雲林', '苗栗', '南投',
  '東區', '西區', '南區', '北區', '中區',
  '信義', '大安', '中山', '中正', '萬華', '士林', '內湖', '松山', '南港', '文山',
  '板橋', '中和', '永和', '新莊', '三重', '蘆洲',
  '中壢', '平鎮', '楊梅',
];

// 品牌詞識別關鍵字（小寫處理）
const BRAND_INDICATORS = ['官網', '官方', 'logo', 'app下載'];

// 季節 / 節慶
const SEASONAL_MODIFIERS = [
  '母親節', '父親節', '情人節', '聖誕', '春節', '中秋', '端午', '萬聖',
  '新年', '年終', '黑色星期五', '雙11', '雙12',
  '開學', '畢業', '招生',
  '夏天', '冬天', '春天', '秋天',
];

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────
function findMatched(kw: string, list: string[]): string | null {
  for (const m of list) {
    if (kw.includes(m)) return m;
  }
  return null;
}

// ─────────────────────────────────────────────────────
// 類型判斷
// ─────────────────────────────────────────────────────
function classifyKeyword(kw: string): KeywordType {
  // 季節性最優先（時效短）
  if (findMatched(kw, SEASONAL_MODIFIERS)) return '季節性';

  // 品牌詞（含「官網」「官方」字眼）
  if (findMatched(kw, BRAND_INDICATORS)) return '品牌詞';

  // 資訊型（含 how / what）
  if (findMatched(kw, INFO_MODIFIERS)) return '資訊型';

  // 在地服務（在地修飾 + 產業）
  const hasLocal = findMatched(kw, LOCAL_MODIFIERS);
  const hasIndustry =
    findMatched(kw, HIGH_CPC_INDUSTRIES) ||
    findMatched(kw, LOW_CPC_INDUSTRIES) ||
    findMatched(kw, MID_CPC_INDUSTRIES);
  if (hasLocal && hasIndustry) return '在地服務';

  // 商業型
  if (findMatched(kw, COMMERCIAL_MODIFIERS)) return '商業型';

  return '通用';
}

// ─────────────────────────────────────────────────────
// 搜尋量判斷
// ─────────────────────────────────────────────────────
function judgeSearchVolume(kw: string, type: KeywordType): { band: Band; reasons: string[] } {
  const reasons: string[] = [];
  const len = kw.length;
  const localMatch = findMatched(kw, LOCAL_MODIFIERS);
  const isInfo = type === '資訊型';
  const isSeasonal = type === '季節性';
  const isBrand = type === '品牌詞';

  if (isBrand) {
    reasons.push('品牌詞 → 流量取決於該品牌知名度，多數是中低');
    return { band: 'low', reasons };
  }
  if (isSeasonal) {
    reasons.push('含節慶／季節詞 → 短期高峰、平時低');
    return { band: 'mid', reasons };
  }
  if (isInfo) {
    reasons.push('資訊型查詢（「怎麼/是什麼/教學」）→ 流量穩定但意圖較弱');
  }

  if (len <= 4 && !localMatch) {
    reasons.push('短字、無地區 → 通常是高流量主類詞');
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

// ─────────────────────────────────────────────────────
// 難度判斷
// ─────────────────────────────────────────────────────
function judgeDifficulty(
  kw: string,
  type: KeywordType,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let diff = 45;

  if (type === '品牌詞') {
    diff = 20;
    reasons.push('品牌詞 → 通常你自己最權威，難度低');
    return { score: diff, reasons };
  }

  if (type === '資訊型') {
    diff -= 5;
    reasons.push('資訊型查詢 → 內容導向，部落格容易做');
  }

  if (type === '季節性') {
    diff += 5;
    reasons.push('季節性 → 旺季前競爭激增');
  }

  const competitiveMod = findMatched(kw, COMMERCIAL_MODIFIERS);
  if (competitiveMod) {
    diff += 15;
    reasons.push(`含商業意圖修飾「${competitiveMod}」→ 大家都在搶`);
  }
  const highInd = findMatched(kw, HIGH_CPC_INDUSTRIES);
  if (highInd) {
    diff += 12;
    reasons.push(`含高競爭產業「${highInd}」→ 多家業者長期投入`);
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

// ─────────────────────────────────────────────────────
// CPC 判斷
// ─────────────────────────────────────────────────────
function judgeCpc(kw: string, type: KeywordType): { band: CpcBand; reasons: string[] } {
  const reasons: string[] = [];

  if (type === '品牌詞') {
    reasons.push('品牌詞 → 通常你自己出最低價就贏（甚至不用跑廣告）');
    return { band: 'low', reasons };
  }

  if (type === '資訊型') {
    reasons.push('資訊型 → 用戶在學東西、不一定買，廣告轉換率低、CPC 不高');
    return { band: 'low', reasons };
  }

  const highIndustry = findMatched(kw, HIGH_CPC_INDUSTRIES);
  if (highIndustry) {
    reasons.push(`高 CPC 產業「${highIndustry}」→ 1 個客戶利潤高，業者願意出高價`);
    return { band: 'high', reasons };
  }

  const midIndustry = findMatched(kw, MID_CPC_INDUSTRIES);
  if (midIndustry) {
    reasons.push(`中等 CPC 產業「${midIndustry}」→ 出價競爭中等`);
    return { band: 'mid', reasons };
  }

  const lowIndustry = findMatched(kw, LOW_CPC_INDUSTRIES);
  if (lowIndustry) {
    reasons.push(`低 CPC 產業「${lowIndustry}」→ 客單價低、廣告出價空間有限`);
    return { band: 'low', reasons };
  }

  const intentMod = findMatched(kw, COMMERCIAL_MODIFIERS);
  if (intentMod) {
    reasons.push(`含商業意圖修飾「${intentMod}」→ 出價競爭中等偏高`);
    return { band: 'mid', reasons };
  }

  reasons.push('一般類詞 → CPC 中等');
  return { band: 'mid', reasons };
}

// ─────────────────────────────────────────────────────
// 建議邏輯
// ─────────────────────────────────────────────────────
function decideRecommendation(
  type: KeywordType,
  volume: Band,
  difficulty: number,
  cpc: CpcBand,
): { recommendation: Recommendation; insight: string } {
  if (type === '品牌詞') {
    return {
      recommendation: 'brand-defense',
      insight:
        '品牌詞先守住——確保你的官網、GBP、相關內容出現在前 3 名。如果競爭對手有跑你的品牌詞廣告，再考慮反擊用 brand campaign。',
    };
  }

  if (type === '資訊型') {
    return {
      recommendation: 'info-seo',
      insight:
        '資訊型查詢適合用 1 篇 1,500+ 字部落格文章鎖定。寫清楚回答這個問題，3-6 個月內可衝到第一頁。不用跑廣告（轉換率不會好）。',
    };
  }

  if (type === '在地服務' && difficulty < 60) {
    return {
      recommendation: 'local-domination',
      insight:
        '在地服務是中小店家的甜蜜點——GBP + 在地內容 + 1 篇深度 blog 就能稱霸。優先把這個字做到前 3 名，比追主流字 ROI 高 5 倍。',
    };
  }

  if (type === '季節性') {
    return {
      recommendation: 'seasonal-burst',
      insight:
        '季節性詞短期高峰、平時低。旺季前 4-6 週開始跑廣告 + 寫 1 篇 SEO 文章。旺季結束預算收回，留 SEO 文章繼續吃殘量。',
    };
  }

  if (volume === 'very-low') {
    return {
      recommendation: 'skip',
      insight: '搜尋量太低，投資 SEO 或廣告都不划算。換更主流的字試試。',
    };
  }

  if (
    difficulty < 45 &&
    (volume === 'mid' || volume === 'high' || volume === 'very-high')
  ) {
    return {
      recommendation: 'strong-seo',
      insight: '低難度 + 不錯的量。優先做 SEO，3-6 個月內可衝到前 3 名。',
    };
  }

  if (difficulty >= 70 && cpc === 'high') {
    return {
      recommendation: 'ads-and-seo',
      insight: '高競爭高單價字。短期跑廣告搶單，長期慢慢做 SEO 降廣告依賴。',
    };
  }

  if (difficulty >= 65 && cpc === 'low') {
    return {
      recommendation: 'ads-only',
      insight: 'SEO 很難但 CPC 不貴。跑小預算廣告（NT$5,000/月）測試轉換。',
    };
  }

  if (volume === 'low' && difficulty < 50) {
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

// ─────────────────────────────────────────────────────
// 同義詞 / 長尾建議
// ─────────────────────────────────────────────────────
function generateSynonyms(kw: string): string[] {
  const out = new Set<string>();
  const industry =
    findMatched(kw, HIGH_CPC_INDUSTRIES) ||
    findMatched(kw, MID_CPC_INDUSTRIES) ||
    findMatched(kw, LOW_CPC_INDUSTRIES);
  const local = findMatched(kw, LOCAL_MODIFIERS);

  if (industry && local) {
    // 同產業 + 同地區，換商業修飾
    out.add(`${industry} ${local} 推薦`);
    out.add(`${industry} ${local} 評價`);
    out.add(`${local} ${industry}`);
  } else if (industry) {
    // 同產業，加地區
    out.add(`${industry} 台北`);
    out.add(`${industry} 推薦`);
    out.add(`${industry} 評價`);
  } else if (local) {
    out.add(`${kw.replace(local, '').trim()} ${local}`);
  }

  // 移除 = 原字
  out.delete(kw);
  return Array.from(out).slice(0, 3);
}

function generateLongTails(kw: string, type: KeywordType): string[] {
  if (type === '品牌詞' || type === '資訊型') return [];

  const out = new Set<string>();
  const industry =
    findMatched(kw, HIGH_CPC_INDUSTRIES) ||
    findMatched(kw, MID_CPC_INDUSTRIES) ||
    findMatched(kw, LOW_CPC_INDUSTRIES);
  const local = findMatched(kw, LOCAL_MODIFIERS);

  if (industry) {
    out.add(`${industry} 怎麼選`);
    out.add(`${industry} 注意事項`);
    out.add(`${industry} 費用 2026`);
    if (!local) out.add(`${industry} 推薦`);
  }

  if (local) {
    out.add(`${local} ${industry || '推薦'}`);
  }

  if (type !== '在地服務') {
    out.add(`${kw} ptt`);
    out.add(`${kw} dcard`);
  }

  out.delete(kw);
  return Array.from(out).slice(0, 4);
}

// ─────────────────────────────────────────────────────
// 主分析
// ─────────────────────────────────────────────────────
export function mockAnalyzeKeywords(input: KeywordInput): KeywordResult[] {
  return input.keywords.map((raw) => {
    const kw = raw.trim();
    const type = classifyKeyword(kw);
    const v = judgeSearchVolume(kw, type);
    const d = judgeDifficulty(kw, type);
    const c = judgeCpc(kw, type);
    const { recommendation, insight } = decideRecommendation(type, v.band, d.score, c.band);

    return {
      keyword: kw,
      type,
      searchVolumeBand: v.band,
      searchVolumeReasons: v.reasons,
      difficulty: d.score,
      difficultyReasons: d.reasons,
      cpcBand: c.band,
      cpcReasons: c.reasons,
      recommendation,
      insight,
      synonyms: generateSynonyms(kw),
      longTails: generateLongTails(kw, type),
    };
  });
}

// ─────────────────────────────────────────────────────
// Display labels
// ─────────────────────────────────────────────────────
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

export const TYPE_LABEL: Record<KeywordType, string> = {
  通用: '通用',
  商業型: '🛒 商業型',
  資訊型: '📖 資訊型',
  品牌詞: '🏷️ 品牌詞',
  在地服務: '📍 在地服務',
  季節性: '🗓️ 季節性',
};

export const TYPE_TONE: Record<KeywordType, string> = {
  通用: 'bg-slate-100 text-slate-700',
  商業型: 'bg-blue-50 text-blue-700',
  資訊型: 'bg-violet-50 text-violet-700',
  品牌詞: 'bg-emerald-50 text-emerald-700',
  在地服務: 'bg-amber-50 text-amber-700',
  季節性: 'bg-rose-50 text-rose-700',
};

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  'strong-seo': '🔥 強推 SEO',
  'ads-and-seo': '💪 廣告 + 長期 SEO',
  'ads-only': '🎯 跑廣告試試',
  'longtail-seo': '✏️ 長尾 SEO 機會',
  'brand-defense': '🛡️ 品牌防禦',
  'info-seo': '📚 資訊型 SEO',
  'local-domination': '🏆 在地獨占機會',
  'seasonal-burst': '🎯 季節短打',
  skip: '⏭️ 跳過',
};

export const RECOMMENDATION_TONE: Record<Recommendation, string> = {
  'strong-seo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'ads-and-seo': 'bg-blue-50 text-blue-700 border-blue-200',
  'ads-only': 'bg-amber-50 text-amber-700 border-amber-200',
  'longtail-seo': 'bg-violet-50 text-violet-700 border-violet-200',
  'brand-defense': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'info-seo': 'bg-violet-100 text-violet-800 border-violet-300',
  'local-domination': 'bg-amber-100 text-amber-800 border-amber-300',
  'seasonal-burst': 'bg-rose-50 text-rose-700 border-rose-200',
  skip: 'bg-slate-100 text-slate-500 border-slate-200',
};

// ─────────────────────────────────────────────────────
// CSV / 純文字匯出
// ─────────────────────────────────────────────────────
export function exportToCSV(results: KeywordResult[]): string {
  const rows = [
    ['關鍵字', '類型', '搜尋量', 'SEO 難度', 'CPC', '建議', '判斷依據'],
    ...results.map((r) => [
      r.keyword,
      r.type,
      VOLUME_LABEL[r.searchVolumeBand],
      String(r.difficulty),
      CPC_LABEL[r.cpcBand],
      RECOMMENDATION_LABEL[r.recommendation].replace(/^[^\s]+\s/, ''), // 去 emoji
      r.insight,
    ]),
  ];
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function exportToText(results: KeywordResult[]): string {
  return results
    .map((r) => {
      const lines = [
        `▍ ${r.keyword}`,
        `類型：${r.type}`,
        `搜尋量：${VOLUME_LABEL[r.searchVolumeBand]}`,
        `SEO 難度：${r.difficulty}/100`,
        `CPC：${CPC_LABEL[r.cpcBand]}`,
        `建議：${RECOMMENDATION_LABEL[r.recommendation]}`,
        `說明：${r.insight}`,
      ];
      if (r.synonyms.length > 0) lines.push(`同義詞建議：${r.synonyms.join('、')}`);
      if (r.longTails.length > 0) lines.push(`長尾建議：${r.longTails.join('、')}`);
      return lines.join('\n');
    })
    .join('\n\n');
}
