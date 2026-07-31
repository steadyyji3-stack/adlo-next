import 'server-only';
import { insertRow, selectRows, updateRows } from '@/lib/supabase-rest';

/**
 * Track A `/check` 伺服器端分數快照。
 *
 * 這是 docs/api/track-a-check-history-contract.md 的 Track A 實作。
 * Track B 唯讀消費本模組匯出的 read 函式，不得自建第二套分數表，
 * 也不得在伺服器端讀取瀏覽器 localStorage。
 *
 * 邊界：
 * - 本模組不接觸 email、IP 或任何 Google 授權憑證。
 * - 寫入失敗不可影響 /check 本身的回應（見 recordCheckSnapshot 的 fire-and-forget 用法）。
 */

/** 計分邏輯版本。改動 /check 的計分方式時必須遞增。
 *  Track B 只比較 sourceVersion 相同的兩筆快照。 */
export const CHECK_SOURCE_VERSION = 'check-v1';

/** 契約定義的維度。目前 /check 產出 6 個；content 尚未實作，一律為 null。 */
export interface CheckSnapshotDimensions {
  profile: number | null;
  reviews: number | null;
  reply: number | null;
  photos: number | null;
  keywords: number | null;
  local: number | null;
  content: number | null;
}

/** 對應契約的 CheckHistorySnapshot。 */
export interface CheckHistorySnapshot {
  storeProfileKey: string;
  checkedAt: string;
  overallScore: number;
  dimensions: CheckSnapshotDimensions;
  sourceVersion: string;
}

interface StoreProfileRow {
  store_profile_key: string;
}

interface SnapshotRow {
  store_profile_key: string;
  checked_at: string;
  overall_score: number;
  dimensions: CheckSnapshotDimensions;
  source_version: string;
}

/** 正規化店家識別。大小寫、前後空白與全形空白不影響同一性。 */
function normalize(value: string): string {
  return value.trim().replace(/[\s　]+/g, ' ').toLowerCase().slice(0, 200);
}

/**
 * 取得（必要時建立）某店家的 opaque store profile key。
 *
 * key 是隨機 UUID，**不由店名推導**，因此無法被反推或猜測；
 * 只有實際查過該店家的一方才會拿到。
 *
 * Track B 在付費 onboarding「由客戶明確確認要連結哪個店家」之後呼叫本函式，
 * 把回傳的 key 存進付費 store profile。Track B 不得以 email、URL 或店名做比對。
 */
export async function resolveStoreProfileKey(
  storeName: string,
  location: string,
): Promise<string> {
  const normalized_name = normalize(storeName);
  const normalized_location = normalize(location);
  if (!normalized_name) throw new Error('storeName is required');

  const existing = await selectRows<StoreProfileRow>(
    'check_store_profiles',
    { normalized_name, normalized_location },
    { select: 'store_profile_key', limit: 1 },
  );

  if (existing[0]) {
    // 更新最後出現時間，失敗不影響主流程
    await updateRows(
      'check_store_profiles',
      { normalized_name, normalized_location },
      { last_seen_at: new Date().toISOString() },
    ).catch(() => undefined);
    return existing[0].store_profile_key;
  }

  const created = await insertRow<StoreProfileRow>('check_store_profiles', {
    normalized_name,
    normalized_location,
  });
  return created.store_profile_key;
}

/** 去重視窗：同一店家在此時間內、分數與版本都相同的重測，不重複寫入。
 *  免費層無登入門檻，若不設限會被反覆重測灌爆資料表。 */
const DEDUP_WINDOW_HOURS = 6;

/** 寫入結果。skipped 代表命中去重，不是錯誤。 */
export type RecordSnapshotResult =
  | { written: true; storeProfileKey: string }
  | { written: false; reason: 'duplicate'; storeProfileKey: string };

/**
 * 寫入一筆分數快照。
 *
 * **呼叫端必須容忍失敗（fail-open）**：/check 的價值是即時給出分數，
 * 快照寫入失敗不應讓使用者拿不到結果。建議寫法：
 *   recordCheckSnapshot(...).catch((e) => console.error('[check-snapshots] 寫入失敗', e));
 *
 * 去重：同一店家 {@link DEDUP_WINDOW_HOURS} 小時內、分數與 source_version
 * 都相同時跳過寫入。分數有變動則照常寫入 —— 變化才是這張表的價值。
 */
export async function recordCheckSnapshot(input: {
  storeName: string;
  location: string;
  overallScore: number;
  dimensions: Partial<CheckSnapshotDimensions>;
}): Promise<RecordSnapshotResult> {
  const storeProfileKey = await resolveStoreProfileKey(input.storeName, input.location);
  const overallScore = Math.round(input.overallScore);

  const latest = await getLatestCheckSnapshot(storeProfileKey);
  if (
    latest &&
    latest.overallScore === overallScore &&
    latest.sourceVersion === CHECK_SOURCE_VERSION &&
    Date.now() - new Date(latest.checkedAt).getTime() < DEDUP_WINDOW_HOURS * 3_600_000
  ) {
    return { written: false, reason: 'duplicate', storeProfileKey };
  }

  const dimensions: CheckSnapshotDimensions = {
    profile: input.dimensions.profile ?? null,
    reviews: input.dimensions.reviews ?? null,
    reply: input.dimensions.reply ?? null,
    photos: input.dimensions.photos ?? null,
    keywords: input.dimensions.keywords ?? null,
    local: input.dimensions.local ?? null,
    content: input.dimensions.content ?? null,
  };

  await insertRow('check_snapshots', {
    store_profile_key: storeProfileKey,
    overall_score: overallScore,
    dimensions,
    source_version: CHECK_SOURCE_VERSION,
  });

  return { written: true, storeProfileKey };
}

/**
 * Track B 的唯讀入口：依 opaque key 取最新 N 筆快照（新到舊）。
 *
 * Track B 必須自行確保呼叫時的 key 屬於當前 session 的客戶
 * （契約要求：Customer A 不得取得 Customer B 的歷史）。
 * 本函式不做 session 驗證 —— 它不知道誰在呼叫。
 */
export async function listCheckSnapshots(
  storeProfileKey: string,
  limit = 24,
): Promise<CheckHistorySnapshot[]> {
  const rows = await selectRows<SnapshotRow>(
    'check_snapshots',
    { store_profile_key: storeProfileKey },
    {
      select: 'store_profile_key,checked_at,overall_score,dimensions,source_version',
      order: 'checked_at.desc',
      limit,
    },
  );

  return rows.map((r) => ({
    storeProfileKey: r.store_profile_key,
    checkedAt: r.checked_at,
    overallScore: r.overall_score,
    dimensions: r.dimensions,
    sourceVersion: r.source_version,
  }));
}

/** 取最新一筆，供 Track B 的 baseline_snapshot 使用。無資料回 null。 */
export async function getLatestCheckSnapshot(
  storeProfileKey: string,
): Promise<CheckHistorySnapshot | null> {
  const [latest] = await listCheckSnapshots(storeProfileKey, 1);
  return latest ?? null;
}
