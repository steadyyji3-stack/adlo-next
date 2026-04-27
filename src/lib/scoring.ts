import 'server-only';

export interface GBPSnapshot {
  name: string;
  location: string;
  /** 0-100：類別、服務項目、營業時間、網站、電話、地址、描述等填寫比例 */
  profileCompleteness: number;
  /** 評論總數 */
  reviewCount: number;
  /** 平均星等 0-5 */
  avgRating: number;
  /** 店家對評論的回覆率 0-1 */
  replyRate: number;
  /** 照片張數 */
  photoCount: number;
  /** 相關關鍵字命中數 0-10 */
  keywordHits: number;
  /** 同地區同業總數（用來衡量競爭強度） */
  regionalCompetitors: number;
}

export interface ScoreBreakdown {
  profile: number;
  reviews: number;
  reply: number;
  photos: number;
  keywords: number;
  local: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  weakestMetric: string;
  regionRankPercent: number;
}

// 權重（總和 = 1.0）對應 FAQ「分數怎麼算的？」
const WEIGHTS = {
  profile: 0.20,
  reviews: 0.20,
  reply: 0.15,
  photos: 0.15,
  keywords: 0.15,
  local: 0.15,
} as const;

const METRIC_LABELS: Record<keyof ScoreBreakdown, string> = {
  profile: '商家檔案完整度',
  reviews: '評論數量與星等',
  reply: '店家回覆率',
  photos: '照片豐富度',
  keywords: '關鍵字命中',
  local: '在地競爭力',
};

/**
 * 將各原始指標轉為 0-100 子分數。
 * 皆為 rule-based — 不使用 AI。
 */
function toSubScores(snap: GBPSnapshot): ScoreBreakdown {
  // Profile：直接使用
  const profile = clamp(snap.profileCompleteness, 0, 100);

  // Reviews：評論數 + 星等混合。100 則滿分，星等 4.5+ 加成。
  const countScore = Math.min(100, (snap.reviewCount / 100) * 100);
  const ratingScore = ((snap.avgRating - 3) / 2) * 100; // 3.0 = 0, 5.0 = 100
  const reviews = clamp(countScore * 0.6 + ratingScore * 0.4, 0, 100);

  // Reply：0-1 線性映射到 0-100
  const reply = clamp(snap.replyRate * 100, 0, 100);

  // Photos：20 張滿分
  const photos = clamp((snap.photoCount / 20) * 100, 0, 100);

  // Keywords：10 hits = 100
  const keywords = clamp((snap.keywordHits / 10) * 100, 0, 100);

  // Local：競爭者越多，相對排名越難拿高分。
  // 同業 <5 家 = 90+；5-20 家 = 70-90；20-50 家 = 50-70；>50 = <50
  let local: number;
  if (snap.regionalCompetitors <= 5) local = 95;
  else if (snap.regionalCompetitors <= 20) local = 90 - (snap.regionalCompetitors - 5);
  else if (snap.regionalCompetitors <= 50) local = 75 - (snap.regionalCompetitors - 20) * 0.8;
  else local = Math.max(30, 50 - (snap.regionalCompetitors - 50) * 0.3);

  return {
    profile: Math.round(profile),
    reviews: Math.round(reviews),
    reply: Math.round(reply),
    photos: Math.round(photos),
    keywords: Math.round(keywords),
    local: Math.round(clamp(local, 0, 100)),
  };
}

export function computeScore(snap: GBPSnapshot): ScoreResult {
  const breakdown = toSubScores(snap);

  const score =
    breakdown.profile * WEIGHTS.profile +
    breakdown.reviews * WEIGHTS.reviews +
    breakdown.reply * WEIGHTS.reply +
    breakdown.photos * WEIGHTS.photos +
    breakdown.keywords * WEIGHTS.keywords +
    breakdown.local * WEIGHTS.local;

  // 找出最弱的指標（供分享卡與 CTA 動態文案）
  const entries = Object.entries(breakdown) as [keyof ScoreBreakdown, number][];
  entries.sort((a, b) => a[1] - b[1]);
  const weakestKey = entries[0][0];

  // 區域排名：以總分的百分位粗估（低分對應排名越後）
  // 80+ 分 → 前 15%，60-79 → 15-40%，40-59 → 40-70%，<40 → 70%+
  const total = Math.round(score);
  let regionRankPercent: number;
  if (total >= 80) regionRankPercent = clamp(15 - Math.floor((total - 80) / 2), 3, 15);
  else if (total >= 60) regionRankPercent = 40 - Math.floor((total - 60) / 2);
  else if (total >= 40) regionRankPercent = 70 - Math.floor((total - 40) / 2);
  else regionRankPercent = clamp(95 - Math.floor(total / 2), 70, 99);

  return {
    score: total,
    breakdown,
    weakestMetric: METRIC_LABELS[weakestKey],
    regionRankPercent,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
