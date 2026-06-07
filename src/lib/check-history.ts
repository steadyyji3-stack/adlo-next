/**
 * /check 分數歷史 — 純瀏覽器 localStorage 層。
 *
 * 為什麼存在（S0 Track A 依賴）：
 * - /check 原本是一次性，查完就走。要證明「分數曲線往上」，得能存基準 + 比對。
 * - 這是「共同結果儀表板」與「證據引擎 before/after」共用的數據源。
 * - Phase 1 純本機（無後端、無客戶資料上伺服器）。Phase 2 Track B 的 customer
 *   dashboard 會消費同一份結構（伺服器版）。
 *
 * 設計：單一 key、版本化、每店一日一點（同日重查覆蓋）、容量上限。
 */

export interface CheckBreakdown {
  profile: number;
  reviews: number;
  reply: number;
  photos: number;
  keywords: number;
  local: number;
}

export interface CheckSnapshot {
  storeName: string;
  location: string;
  score: number;
  breakdown: CheckBreakdown;
  /** ISO 字串 */
  at: string;
}

export interface CheckSnapshotInput {
  storeName: string;
  location: string;
  score: number;
  breakdown: CheckBreakdown;
}

const STORAGE_KEY = 'adlo_check_history_v1';
const MAX_SNAPSHOTS_PER_STORE = 24;
const MAX_STORES = 50;

type HistoryMap = Record<string, CheckSnapshot[]>;

function storeKey(storeName: string, location: string): string {
  return `${storeName.trim().toLowerCase()}|${location.trim().toLowerCase()}`;
}

function dayStamp(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function readMap(): HistoryMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as HistoryMap;
  } catch {
    return {};
  }
}

function writeMap(map: HistoryMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 隱私模式 / 容量滿 — 靜默失敗，當次畫面仍可用
  }
}

/** 回傳某店所有快照，舊 → 新排序。沒有則空陣列。 */
export function getCheckHistory(storeName: string, location: string): CheckSnapshot[] {
  const map = readMap();
  const list = map[storeKey(storeName, location)];
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => a.at.localeCompare(b.at));
}

/**
 * 紀錄一筆快照。同店同日重查 → 覆蓋當日那筆（保持一日一點的趨勢）。
 * 回傳寫入後該店的完整歷史（舊 → 新）。
 */
export function recordCheckSnapshot(input: CheckSnapshotInput): CheckSnapshot[] {
  const at = new Date().toISOString();
  const snap: CheckSnapshot = {
    storeName: input.storeName.trim(),
    location: input.location.trim(),
    score: input.score,
    breakdown: input.breakdown,
    at,
  };

  const map = readMap();
  const key = storeKey(snap.storeName, snap.location);
  const list = Array.isArray(map[key]) ? [...map[key]] : [];

  // 同日覆蓋
  const today = dayStamp(at);
  const sameDayIdx = list.findIndex((s) => dayStamp(s.at) === today);
  if (sameDayIdx >= 0) {
    list[sameDayIdx] = snap;
  } else {
    list.push(snap);
  }

  // 每店上限
  list.sort((a, b) => a.at.localeCompare(b.at));
  const trimmed = list.slice(-MAX_SNAPSHOTS_PER_STORE);
  map[key] = trimmed;

  // 總店數上限：超過就移除「最近一次快照最舊」的店
  const keys = Object.keys(map);
  if (keys.length > MAX_STORES) {
    keys
      .map((k) => ({ k, last: map[k][map[k].length - 1]?.at ?? '' }))
      .sort((a, b) => a.last.localeCompare(b.last))
      .slice(0, keys.length - MAX_STORES)
      .forEach(({ k }) => delete map[k]);
  }

  writeMap(map);
  return trimmed;
}
