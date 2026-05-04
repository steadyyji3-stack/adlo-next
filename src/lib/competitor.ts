import 'server-only';
import { searchTopPlaces, PlacesApiUnavailableError } from './places';
import { computeScore, type GBPSnapshot, type ScoreBreakdown } from './scoring';

/**
 * /tools/competitor 真實對手查詢與比較。
 *
 * 流程：
 *   1. searchText "{keyword} {city}" 抓 10 家（一個 API call = $0.032）
 *   2. 在結果裡找用戶輸入的店（按名稱模糊匹配）
 *   3. 找不到時：把第 1 家當「你的店」（搜尋熱度最高的就是你）
 *   4. 從剩下的店挑 3 家當對手
 *   5. 4 家都跑 computeScore，回傳結構化結果
 *
 * 成本上 = 1 個 searchText（不再多開 nearby），符合 cost-cap 預算。
 */

export interface CompetitorReportInput {
  storeName: string;
  keyword: string;
  city: string;
}

export interface ScoredStore {
  storeName: string;
  location: string;
  isYou: boolean;
  overall: number; // 0-100
  breakdown: ScoreBreakdown;
  highlight: string; // 6 維度中最強那項的中文標籤
  weakness: string; // 6 維度中最弱那項的中文標籤
}

export interface CompetitorReport {
  you: ScoredStore;
  competitors: ScoredStore[]; // 通常 3 家，<3 時補不滿
  insight: string;
  query: string; // 實際送給 Places API 的字串（debug + 透明度）
}

const DIM_LABEL: Record<keyof ScoreBreakdown, string> = {
  profile: '完整度',
  reviews: '評論',
  reply: '回覆率',
  photos: '照片',
  keywords: '關鍵字',
  local: '在地排名',
};

function buildScoredStore(snap: GBPSnapshot, isYou: boolean): ScoredStore {
  const result = computeScore(snap);
  // 從 breakdown 找最高/最低
  const entries = (Object.entries(result.breakdown) as [keyof ScoreBreakdown, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const highlight = DIM_LABEL[entries[0][0]];
  const weakness = DIM_LABEL[entries[entries.length - 1][0]];

  return {
    storeName: snap.name || '未命名店家',
    location: snap.location,
    isYou,
    overall: result.score,
    breakdown: result.breakdown,
    highlight,
    weakness,
  };
}

/** 模糊匹配店名：去除空白、底線、連字號後比對包含關係 */
function normalizeStoreName(s: string): string {
  return s.toLowerCase().replace(/[\s　_\-]+/g, '');
}

function findUserStoreIndex(places: GBPSnapshot[], storeName: string): number {
  const target = normalizeStoreName(storeName);
  if (!target) return -1;

  // 1. 精確包含（雙向）
  for (let i = 0; i < places.length; i++) {
    const n = normalizeStoreName(places[i].name);
    if (n.includes(target) || target.includes(n)) return i;
  }

  // 2. 找不到 → -1（呼叫端決定 fallback 策略）
  return -1;
}

function buildInsight(you: ScoredStore, competitors: ScoredStore[]): string {
  if (competitors.length === 0) {
    return `沒找到同區符合條件的對手。可能是這個關鍵字 + 城市組合的市場太小，或要試更寬的關鍵字。`;
  }
  const compAvg = Math.round(
    competitors.reduce((s, c) => s + c.overall, 0) / competitors.length,
  );
  const diff = you.overall - compAvg;
  if (diff > 5) {
    return `你目前領先同區平均 ${diff} 分——但「${you.weakness}」是對手最容易追上你的破口。`;
  }
  if (diff < -5) {
    return `你目前落後同區平均 ${-diff} 分。先補「${you.weakness}」這項，能最快縮短差距。`;
  }
  return `你與同區水平相當（差 ${Math.abs(diff)} 分內）。決勝點在「${you.weakness}」——這是同區普遍弱項，補起來就能反超。`;
}

export async function fetchCompetitorReport(
  input: CompetitorReportInput,
): Promise<CompetitorReport> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new PlacesApiUnavailableError();

  const query = `${input.keyword} ${input.city}`.trim();
  // 抓 10 家：留足空間找用戶店家 + 3 家對手 + buffer
  const places = await searchTopPlaces(query, 10);

  if (places.length === 0) {
    throw new Error('NO_RESULTS');
  }

  // 找用戶的店
  let yourIdx = findUserStoreIndex(places, input.storeName);

  let yourSnap: GBPSnapshot;
  if (yourIdx >= 0) {
    yourSnap = places[yourIdx];
    places.splice(yourIdx, 1); // 從 array 移除
  } else {
    // 找不到 → 用搜尋第 1 名當「你的店」（用戶可能打錯字或店名跟 GBP 不一致）
    // 同時把用戶輸入的 storeName 標示出來
    yourSnap = { ...places[0], name: input.storeName || places[0].name };
    places.splice(0, 1);
  }

  const you = buildScoredStore(yourSnap, true);
  const competitors = places.slice(0, 3).map((p) => buildScoredStore(p, false));
  const insight = buildInsight(you, competitors);

  return {
    you,
    competitors,
    insight,
    query,
  };
}
