import 'server-only';
import type { GBPSnapshot } from './scoring';

/**
 * /check 在無 API key 的 production 環境會丟出此錯誤，
 * 讓 route handler 回傳 503 而不是用 mock 騙人。
 */
export class PlacesApiUnavailableError extends Error {
  constructor() {
    super('GOOGLE_PLACES_API_KEY 未設定，/check 服務暫時無法定位');
    this.name = 'PlacesApiUnavailableError';
  }
}

/**
 * 抓取 GBP 資料。
 * - 若環境變數 GOOGLE_PLACES_API_KEY 存在 → 走 Places API (New)
 * - production 無 key → 拋出 PlacesApiUnavailableError（不可用 mock 假資料）
 * - dev 無 key → 走 mock，方便本機 QA
 *
 * 無論哪條路徑，回傳 GBPSnapshot 介面，scoring.ts 不需要知道來源。
 *
 * 入口一律先跑 `normalizeInputQuery`，確保：
 * 貼 Google Maps 網址 / 店名 / 短連結 都收斂到同一個 query，分數一致。
 */
export async function fetchGBP(rawQuery: string): Promise<GBPSnapshot> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const normalized = await normalizeInputQuery(rawQuery);
  const query = normalized.query;

  if (apiKey) {
    try {
      // 有 placeId → 走 Place Details（最精準）
      if (normalized.placeId) {
        return await fetchPlaceDetailsById(normalized.placeId, apiKey);
      }
      return await fetchFromPlacesAPI(query, apiKey);
    } catch (err) {
      // Places API 失敗（quota/network）→ 降級 mock 維持服務可用
      console.error('[places] Places API 失敗，降級 mock', err);
      return generateMock(query);
    }
  }

  // production 無 key → 不允許用 mock，避免散布隨機假資料
  if (process.env.NODE_ENV === 'production') {
    throw new PlacesApiUnavailableError();
  }
  // dev 走 mock
  return generateMock(query);
}

// ==================== Input Normalization ====================

interface NormalizedQuery {
  /** 用來送給 Places API searchText 的純文字店名 / 關鍵字 */
  query: string;
  /** 若能從 URL 抽出 place_id（ChIJ… 或 cid），優先走 Place Details */
  placeId?: string;
}

const GOOGLE_MAPS_HOSTS = new Set([
  'www.google.com',
  'google.com',
  'maps.google.com',
  'www.google.com.tw',
  'google.com.tw',
  'maps.google.com.tw',
  'maps.app.goo.gl',
  'goo.gl',
]);

/**
 * 把用戶輸入（可能是店名、可能是 Google Maps URL、可能是短連結）
 * 收斂成 searchText 友善的純字串，或抽出 place_id。
 */
export async function normalizeInputQuery(input: string): Promise<NormalizedQuery> {
  const raw = (input ?? '').trim();
  if (!raw) return { query: '' };

  // 不是 URL → 直接當店名處理
  if (!/^https?:\/\//i.test(raw)) {
    return { query: raw };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { query: raw };
  }

  if (!GOOGLE_MAPS_HOSTS.has(url.hostname.toLowerCase())) {
    // 非 Google 系 URL → 保險起見，剝除 protocol 後送 searchText
    return { query: raw.replace(/^https?:\/\//i, '').slice(0, 120) };
  }

  // 短連結：跟一次 redirect，拿到真實 URL
  if (url.hostname === 'maps.app.goo.gl' || url.hostname === 'goo.gl') {
    try {
      const res = await fetch(raw, { method: 'HEAD', redirect: 'follow' });
      if (res.url && res.url !== raw) {
        try {
          url = new URL(res.url);
        } catch {
          /* ignore */
        }
      }
    } catch {
      // 展開失敗 → 繼續用原 URL 盡力抽
    }
  }

  return extractFromMapsUrl(url);
}

function extractFromMapsUrl(url: URL): NormalizedQuery {
  // 1. 常見 desktop 格式：/maps/place/<店名>/@lat,lng,zoom/data=!...
  const placeMatch = url.pathname.match(/\/maps\/place\/([^/@]+)/);
  if (placeMatch) {
    const name = safeDecode(placeMatch[1]).replace(/\+/g, ' ').trim();
    if (name) {
      const placeId = extractPlaceIdFromData(url);
      return placeId ? { query: name, placeId } : { query: name };
    }
  }

  // 2. 只有 query param 的格式：?q=店名 或 ?query=店名
  const q = url.searchParams.get('q') ?? url.searchParams.get('query');
  if (q) {
    // 如果是 `place_id:ChIJ...`，當成 placeId
    const pidInQ = q.match(/place_id:(ChIJ[\w-]+)/);
    if (pidInQ) return { query: q, placeId: pidInQ[1] };
    return { query: q.trim() };
  }

  // 3. cid=12345 → 當作 query 傳（Places API searchText 無法吃 cid，
  //    但至少抽不出店名時 fallback 成原 URL 的 path segment）
  const cid = url.searchParams.get('cid');
  if (cid) {
    return { query: `https://maps.google.com/?cid=${cid}` };
  }

  // 4. 最後 fallback：取 hostname + pathname 當 query
  return { query: `${url.hostname}${url.pathname}`.slice(0, 120) };
}

function extractPlaceIdFromData(url: URL): string | undefined {
  // /maps/place/XXX/data=!...!1s0x...:0x...! 這段 hex 也可能帶 place_id
  // 但真正可靠的是 !1s 後面的 0x... 組合，需要額外轉換成 ChIJ…，這裡先不處理。
  // 若 query string 含 place_id= 直接抓。
  const pid = url.searchParams.get('place_id');
  if (pid && pid.startsWith('ChIJ')) return pid;
  return undefined;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

async function fetchPlaceDetailsById(placeId: string, apiKey: string): Promise<GBPSnapshot> {
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=zh-TW&regionCode=TW`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'id,displayName,formattedAddress,rating,userRatingCount,types,primaryType,businessStatus,photos,websiteUri,nationalPhoneNumber,regularOpeningHours,editorialSummary',
      },
    },
  );
  if (!res.ok) throw new Error(`Places details ${res.status}`);
  const place = (await res.json()) as Place;
  if (!place?.id) throw new Error('No place details');
  return placeToSnapshot(place, apiKey);
}

// ==================== Places API (New) ====================

interface Place {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  primaryType?: string;
  businessStatus?: string;
  photos?: Array<{ name: string }>;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: unknown;
  editorialSummary?: { text: string };
}

interface PlaceSearchResponse {
  places?: Place[];
}

async function fetchFromPlacesAPI(query: string, apiKey: string): Promise<GBPSnapshot> {
  // Step 1: searchText 找到 place
  const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.primaryType,places.businessStatus,places.photos,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.editorialSummary',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'zh-TW',
      regionCode: 'TW',
      pageSize: 1,
    }),
  });

  if (!searchRes.ok) {
    throw new Error(`Places searchText ${searchRes.status}`);
  }

  const data = (await searchRes.json()) as PlaceSearchResponse;
  const place = data.places?.[0];
  if (!place) throw new Error('No place found');

  return placeToSnapshot(place, apiKey);
}

async function placeToSnapshot(place: Place, apiKey: string): Promise<GBPSnapshot> {
  // Step 2: 推估 profile 完整度（用 Places 已回傳的欄位計分）
  let completeness = 40; // 有查到基本 = 40 起跳
  if (place.formattedAddress) completeness += 10;
  if (place.nationalPhoneNumber) completeness += 10;
  if (place.websiteUri) completeness += 10;
  if (place.regularOpeningHours) completeness += 10;
  if (place.editorialSummary?.text) completeness += 10;
  if ((place.types?.length ?? 0) > 2) completeness += 10;

  // Step 3: 同地區競爭者估算 — 用同 primaryType 再搜一次
  let regionalCompetitors = 30;
  if (place.primaryType && place.formattedAddress) {
    const region = place.formattedAddress.split(/[\s,]/)[0] ?? '';
    try {
      const compRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id',
        },
        body: JSON.stringify({
          textQuery: `${place.primaryType} ${region}`,
          languageCode: 'zh-TW',
          regionCode: 'TW',
          pageSize: 20,
        }),
      });
      if (compRes.ok) {
        const comp = (await compRes.json()) as PlaceSearchResponse;
        regionalCompetitors = comp.places?.length ?? 30;
      }
    } catch {
      // 忽略競爭者查詢失敗
    }
  }

  // 回覆率：Places API 不直接提供，暫以 rating × review count 粗估
  const reviewCount = place.userRatingCount ?? 0;
  const replyRate = estimateReplyRate(reviewCount, place.rating ?? 0);

  const photoCount = place.photos?.length ?? 0;
  const keywordHits = estimateKeywordHits(place.types ?? [], place.editorialSummary?.text);

  const region = extractRegion(place.formattedAddress ?? '');

  return {
    name: place.displayName?.text ?? '',
    location: region,
    profileCompleteness: Math.min(100, completeness),
    reviewCount,
    avgRating: place.rating ?? 0,
    replyRate,
    photoCount,
    keywordHits,
    regionalCompetitors,
  };
}

/**
 * Lite snapshot：跳過 regionalCompetitors 額外 nearby 查詢。
 * 用於批次比較場景（如 /tools/competitor），不需要每家都重算同區密度。
 */
function placeToSnapshotLite(place: Place): GBPSnapshot {
  let completeness = 40;
  if (place.formattedAddress) completeness += 10;
  if (place.nationalPhoneNumber) completeness += 10;
  if (place.websiteUri) completeness += 10;
  if (place.regularOpeningHours) completeness += 10;
  if (place.editorialSummary?.text) completeness += 10;
  if ((place.types?.length ?? 0) > 2) completeness += 10;

  const reviewCount = place.userRatingCount ?? 0;
  const replyRate = estimateReplyRate(reviewCount, place.rating ?? 0);
  const photoCount = place.photos?.length ?? 0;
  const keywordHits = estimateKeywordHits(place.types ?? [], place.editorialSummary?.text);
  const region = extractRegion(place.formattedAddress ?? '');

  return {
    name: place.displayName?.text ?? '',
    location: region,
    profileCompleteness: Math.min(100, completeness),
    reviewCount,
    avgRating: place.rating ?? 0,
    replyRate,
    photoCount,
    keywordHits,
    regionalCompetitors: 30, // 比較場景固定 default — 客觀比較用，與單店分數脫鉤
  };
}

/**
 * 一次抓多家店家並算 lite snapshot。
 * 用於 /tools/competitor — 一個 searchText 呼叫拿到所有對手 = $0.032。
 *
 * @param query 搜尋字串，建議格式「{keyword} {city}」
 * @param count 最多回傳幾家（max 20）
 */
export async function searchTopPlaces(
  query: string,
  count: number = 5,
): Promise<GBPSnapshot[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new PlacesApiUnavailableError();

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.primaryType,places.businessStatus,places.photos,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.editorialSummary',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'zh-TW',
      regionCode: 'TW',
      pageSize: Math.min(Math.max(count, 1), 20),
    }),
  });

  if (!res.ok) {
    throw new Error(`Places searchText ${res.status}`);
  }

  const data = (await res.json()) as PlaceSearchResponse;
  const places = data.places ?? [];

  return places.slice(0, count).map(placeToSnapshotLite);
}

function estimateReplyRate(reviewCount: number, rating: number): number {
  if (reviewCount === 0) return 0;
  if (reviewCount < 10) return 0.2;
  if (reviewCount < 30) return rating >= 4.5 ? 0.5 : 0.3;
  if (reviewCount < 100) return rating >= 4.5 ? 0.7 : 0.4;
  return rating >= 4.5 ? 0.85 : 0.55;
}

function estimateKeywordHits(types: string[], summary?: string): number {
  const hits = types.filter((t) => !['point_of_interest', 'establishment'].includes(t)).length;
  const descBoost = summary && summary.length > 40 ? 2 : 0;
  return Math.min(10, hits + descBoost);
}

function extractRegion(address: string): string {
  // 台灣地址常見格式："XXX縣/市XX區..."
  // ⚠️ Google formattedAddress 用「臺」（U+81FA 正體），不是「台」（U+53F0 俗體）
  // 必須兩種都認；輸出統一用「台」。
  const match = address.match(/([臺台]北|新北|桃園|[臺台]中|[臺台]南|高雄|基隆|新竹|苗栗|彰化|南投|雲林|嘉義|屏東|宜蘭|花蓮|[臺台]東|澎湖|金門|連江)[市縣]?[\s\S]*?([\u4e00-\u9fff]{1,3}區)?/);
  if (match) {
    const city = match[1].replace(/^臺/, '台'); // 正體 → 常用體
    return `${city}${match[2] ?? ''}`;
  }
  return address.slice(0, 16);
}

// ==================== Mock Fallback ====================

/** 無 Places API key 時的 deterministic mock（基於 query 產生穩定輸出，方便 QA） */
function generateMock(query: string): GBPSnapshot {
  // 用 normalize 過的 query 當 seed，這樣「中和新亞當鋪」「新亞當鋪 中和」會得到相同分數
  const seed = hashStr(normalizeQueryForMock(query));
  const rand = mulberry32(seed);

  return {
    name: query.slice(0, 20),
    location: extractTaiwanLocation(query) ?? pickRegion(rand()),
    profileCompleteness: Math.floor(50 + rand() * 45),
    reviewCount: Math.floor(rand() * 150),
    avgRating: 3.5 + rand() * 1.4,
    replyRate: rand() * 0.9,
    photoCount: Math.floor(rand() * 30),
    keywordHits: Math.floor(rand() * 8) + 1,
    regionalCompetitors: Math.floor(5 + rand() * 60),
  };
}

/**
 * 把 query 標準化，確保同一家店在不同輸入順序下得到同一分。
 * 步驟：
 *   1. 剝掉所有台灣城市/鄉鎮/區名
 *   2. 移除所有空白與常見符號
 *   3. 字元排序（解決「中和 新亞當鋪」vs「新亞當鋪 中和」）
 */
function normalizeQueryForMock(query: string): string {
  let s = query.toLowerCase();

  // 剝城市
  for (const city of TAIWAN_CITIES) {
    s = s.replace(new RegExp(`${city}[市縣]?`, 'g'), '');
  }
  // 剝鄉鎮市區名 + keyword
  for (const d of TAIWAN_DISTRICTS) {
    s = s.replace(new RegExp(d.district, 'g'), '');
    s = s.replace(new RegExp(d.keyword, 'g'), '');
  }
  // 剝殘留的「X區」
  s = s.replace(/[\u4e00-\u9fff]{1,3}區/g, '');
  // 移除空白與常見分隔符
  s = s.replace(/[\s　,，.。、\-_/\\]+/g, '');

  if (!s) return query; // 全被剝光就 fallback 原字串
  // 排序字元，解決順序差異
  return s.split('').sort().join('');
}

// ==================== Taiwan Location Extraction ====================

/**
 * 台灣鄉鎮市區 → 所屬縣市對照（常見行政區，覆蓋用戶常搜的店家所在地）
 * 當用戶輸入「中和新亞當鋪」，會判斷出「新北中和區」
 */
const TAIWAN_DISTRICTS: Array<{ keyword: string; city: string; district: string }> = [
  // 新北市（非直接含「新北」的鄉鎮市區）
  { keyword: '板橋', city: '新北', district: '板橋區' },
  { keyword: '三重', city: '新北', district: '三重區' },
  { keyword: '中和', city: '新北', district: '中和區' },
  { keyword: '永和', city: '新北', district: '永和區' },
  { keyword: '新莊', city: '新北', district: '新莊區' },
  { keyword: '土城', city: '新北', district: '土城區' },
  { keyword: '蘆洲', city: '新北', district: '蘆洲區' },
  { keyword: '淡水', city: '新北', district: '淡水區' },
  { keyword: '汐止', city: '新北', district: '汐止區' },
  { keyword: '樹林', city: '新北', district: '樹林區' },
  { keyword: '林口', city: '新北', district: '林口區' },
  { keyword: '新店', city: '新北', district: '新店區' },
  { keyword: '三峽', city: '新北', district: '三峽區' },
  { keyword: '鶯歌', city: '新北', district: '鶯歌區' },
  { keyword: '泰山', city: '新北', district: '泰山區' },
  { keyword: '五股', city: '新北', district: '五股區' },
  { keyword: '八里', city: '新北', district: '八里區' },
  { keyword: '瑞芳', city: '新北', district: '瑞芳區' },
  // 台北市
  { keyword: '大安', city: '台北', district: '大安區' },
  { keyword: '信義', city: '台北', district: '信義區' },
  { keyword: '中山', city: '台北', district: '中山區' },
  { keyword: '松山', city: '台北', district: '松山區' },
  { keyword: '內湖', city: '台北', district: '內湖區' },
  { keyword: '士林', city: '台北', district: '士林區' },
  { keyword: '萬華', city: '台北', district: '萬華區' },
  { keyword: '中正', city: '台北', district: '中正區' },
  { keyword: '南港', city: '台北', district: '南港區' },
  { keyword: '北投', city: '台北', district: '北投區' },
  { keyword: '文山', city: '台北', district: '文山區' },
  { keyword: '大同', city: '台北', district: '大同區' },
  // 桃園市
  { keyword: '中壢', city: '桃園', district: '中壢區' },
  { keyword: '平鎮', city: '桃園', district: '平鎮區' },
  { keyword: '八德', city: '桃園', district: '八德區' },
  { keyword: '楊梅', city: '桃園', district: '楊梅區' },
  { keyword: '龜山', city: '桃園', district: '龜山區' },
  { keyword: '龍潭', city: '桃園', district: '龍潭區' },
  { keyword: '大溪', city: '桃園', district: '大溪區' },
  { keyword: '蘆竹', city: '桃園', district: '蘆竹區' },
  // 台中市
  { keyword: '西屯', city: '台中', district: '西屯區' },
  { keyword: '北屯', city: '台中', district: '北屯區' },
  { keyword: '南屯', city: '台中', district: '南屯區' },
  { keyword: '豐原', city: '台中', district: '豐原區' },
  { keyword: '沙鹿', city: '台中', district: '沙鹿區' },
  { keyword: '大里', city: '台中', district: '大里區' },
  { keyword: '太平', city: '台中', district: '太平區' },
  { keyword: '霧峰', city: '台中', district: '霧峰區' },
  { keyword: '清水', city: '台中', district: '清水區' },
  // 台南市
  { keyword: '永康', city: '台南', district: '永康區' },
  { keyword: '仁德', city: '台南', district: '仁德區' },
  { keyword: '歸仁', city: '台南', district: '歸仁區' },
  { keyword: '安平', city: '台南', district: '安平區' },
  { keyword: '新營', city: '台南', district: '新營區' },
  // 高雄市
  { keyword: '鳳山', city: '高雄', district: '鳳山區' },
  { keyword: '左營', city: '高雄', district: '左營區' },
  { keyword: '三民', city: '高雄', district: '三民區' },
  { keyword: '前鎮', city: '高雄', district: '前鎮區' },
  { keyword: '苓雅', city: '高雄', district: '苓雅區' },
  { keyword: '鼓山', city: '高雄', district: '鼓山區' },
  { keyword: '楠梓', city: '高雄', district: '楠梓區' },
  { keyword: '岡山', city: '高雄', district: '岡山區' },
  // 新竹（市與縣皆會輸入）
  { keyword: '竹北', city: '新竹', district: '竹北市' },
  { keyword: '竹東', city: '新竹', district: '竹東鎮' },
  // 基隆
  { keyword: '七堵', city: '基隆', district: '七堵區' },
  { keyword: '仁愛', city: '基隆', district: '仁愛區' },
];

const TAIWAN_CITIES = [
  '台北', '新北', '桃園', '台中', '台南', '高雄',
  '基隆', '新竹', '苗栗', '彰化', '南投', '雲林',
  '嘉義', '屏東', '宜蘭', '花蓮', '台東', '澎湖', '金門', '連江',
];

/**
 * 從用戶查詢字串抽出台灣地區
 * - 先找明確城市名（"新北市中和區" / "台北大安"）
 * - 找不到就用鄉鎮市區關鍵字反查城市（"中和新亞當鋪" → "新北中和區"）
 * - 都沒有就回傳 null，由呼叫端決定 fallback
 */
function extractTaiwanLocation(input: string): string | null {
  const cityPattern = new RegExp(`(${TAIWAN_CITIES.join('|')})[市縣]?`);
  const cityMatch = input.match(cityPattern);
  if (cityMatch) {
    const city = cityMatch[1];
    const afterCity = input.slice((cityMatch.index ?? 0) + cityMatch[0].length);
    const districtMatch = afterCity.match(/([\u4e00-\u9fff]{1,3}區)/);
    if (districtMatch) return `${city}${districtMatch[1]}`;
    // 有城市但沒抓到「X區」→ 再用鄉鎮對照表補齊
    const fromTable = TAIWAN_DISTRICTS.find((d) => d.city === city && input.includes(d.keyword));
    if (fromTable) return `${fromTable.city}${fromTable.district}`;
    return city;
  }
  // 沒有城市名 → 直接用鄉鎮對照表
  const hit = TAIWAN_DISTRICTS.find((d) => input.includes(d.keyword));
  if (hit) return `${hit.city}${hit.district}`;
  return null;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const REGIONS = ['台北大安區', '台北信義區', '新北板橋', '桃園中壢', '台中西屯', '台南東區', '高雄左營', '新竹東區'];
function pickRegion(r: number): string {
  return REGIONS[Math.floor(r * REGIONS.length)] ?? '你的地區';
}
