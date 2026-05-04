// Path C：mock data。後續接 Places API + lib/scoring 後此檔可廢棄。

export type City =
  | '台北'
  | '新北'
  | '桃園'
  | '台中'
  | '台南'
  | '高雄'
  | '基隆'
  | '新竹'
  | '其他';

export interface CompetitorInput {
  storeName: string;
  keyword: string;
  city: City;
}

/** 6 維度（沿用 /check 的健診模型）*/
export interface DimensionScores {
  profile: number;
  reviews: number;
  reply: number;
  photos: number;
  keywords: number;
  local: number;
}

export interface StoreScore {
  storeName: string;
  isYou: boolean;
  dimensions: DimensionScores;
  overall: number;
  highlight: string;
  weakness: string;
}

export interface CompetitorResult {
  you: StoreScore;
  /** 通常 3 家。真實 API 可能 < 3（市場太小）或 > 3（極少數情況截斷） */
  competitors: StoreScore[];
  insight: string;
}

export const DIMENSION_LABELS: { key: keyof DimensionScores; label: string }[] = [
  { key: 'profile', label: '完整度' },
  { key: 'reviews', label: '評論' },
  { key: 'reply', label: '回覆率' },
  { key: 'photos', label: '照片' },
  { key: 'keywords', label: '關鍵字' },
  { key: 'local', label: '在地排名' },
];

const DIM_LABEL_BY_KEY: Record<keyof DimensionScores, string> = {
  profile: '完整度',
  reviews: '評論',
  reply: '回覆率',
  photos: '照片',
  keywords: '關鍵字',
  local: '在地排名',
};

// Stable PRNG（同 query → 同分數，方便 demo）
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

const COMPETITOR_NAMES: Record<City, string[]> = {
  台北: ['本格手作 大安店', '日子甜點 信義店', '小山堂 中山店'],
  新北: ['老灶頭 中和店', '青森家 板橋店', '一乘堂 新莊店'],
  桃園: ['澤野家 中壢店', '九號廚房 桃園店', '家鄰豆花 平鎮店'],
  台中: ['品田牧場 西屯店', '森森家 北屯店', '初食所 七期店'],
  台南: ['府城日常 中西區', '巷口工坊 東區店', '老樹咖啡 安平店'],
  高雄: ['風城吃飽 鼓山店', '日子茶屋 苓雅店', '鹽埕舊事 鹽埕店'],
  基隆: ['港邊家 仁愛店', '雨城食堂 中正店', '老海港 安樂店'],
  新竹: ['風起時 東區店', '科城日常 香山店', '老竹苑 北區店'],
  其他: ['同區店家 A', '同區店家 B', '同區店家 C'],
};

function buildScore(
  storeName: string,
  isYou: boolean,
  rand: () => number,
  bias: number = 0,
): StoreScore {
  const dimensions: DimensionScores = {
    profile: Math.min(100, Math.max(20, Math.floor(60 + rand() * 35 + bias))),
    reviews: Math.min(100, Math.max(20, Math.floor(50 + rand() * 45 + bias))),
    reply: Math.min(100, Math.max(20, Math.floor(40 + rand() * 50 + bias))),
    photos: Math.min(100, Math.max(20, Math.floor(45 + rand() * 50 + bias))),
    keywords: Math.min(100, Math.max(20, Math.floor(40 + rand() * 55 + bias))),
    local: Math.min(100, Math.max(20, Math.floor(50 + rand() * 45 + bias))),
  };

  const overall = Math.round(
    (dimensions.profile * 0.2 +
      dimensions.reviews * 0.2 +
      dimensions.reply * 0.15 +
      dimensions.photos * 0.15 +
      dimensions.keywords * 0.15 +
      dimensions.local * 0.15),
  );

  const entries = (Object.entries(dimensions) as [keyof DimensionScores, number][])
    .sort((a, b) => b[1] - a[1]);
  const highlight = DIM_LABEL_BY_KEY[entries[0][0]];
  const weakness = DIM_LABEL_BY_KEY[entries[entries.length - 1][0]];

  return { storeName, isYou, dimensions, overall, highlight, weakness };
}

export function mockGenerateCompetitorReport(
  input: CompetitorInput,
): CompetitorResult {
  const seedYou = hash(`you:${input.storeName}:${input.keyword}:${input.city}`);
  const youRand = mulberry32(seedYou);
  const you = buildScore(input.storeName || '你的店', true, youRand);

  const candidates = COMPETITOR_NAMES[input.city] ?? COMPETITOR_NAMES['其他'];
  const competitors: StoreScore[] = candidates.slice(0, 3).map((name, idx) => {
    const seed = hash(`comp:${name}:${input.keyword}:${idx}`);
    const rand = mulberry32(seed);
    // 對手 A 略強、B 接近、C 略弱（讓視覺更有差異）
    const bias = idx === 0 ? 8 : idx === 1 ? 0 : -6;
    return buildScore(name, false, rand, bias);
  });

  // 一句總結
  const youOverall = you.overall;
  const compAvg = Math.round(
    competitors.reduce((s, c) => s + c.overall, 0) / 3,
  );
  let insight: string;
  if (youOverall > compAvg + 5) {
    insight = `你目前領先同區平均 ${youOverall - compAvg} 分——但「${you.weakness}」是對手最容易追上你的破口。`;
  } else if (youOverall < compAvg - 5) {
    insight = `你目前落後同區平均 ${compAvg - youOverall} 分。先補「${you.weakness}」這項，能最快縮短差距。`;
  } else {
    insight = `你與同區水平相當（差 ${Math.abs(youOverall - compAvg)} 分內）。決勝點在「${you.weakness}」——這是同區普遍弱項，補起來就能反超。`;
  }

  return { you, competitors, insight };
}
