/**
 * 「我的店家檔案」— 純瀏覽器 localStorage 儲存層。
 *
 * Phase 1（免費黏著功能）：店家檔案只存使用者本機，伺服器完全不碰。
 * - 零後端、零登入、零客戶資料上伺服器 → 純 Track A，無 Track B 安全面。
 * - Phase 2（店長版付費）才會把檔案搬到伺服器 + magic-link 登入。
 *
 * 對外提供 useSyncExternalStore 相容 API（subscribe / getSnapshot /
 * getServerSnapshot），讓元件不必在 effect 裡 setState（符合 React 19 規範、
 * 且避免 hydration mismatch）。
 */

import type { Industry } from './gbp-post-writer';

const STORAGE_KEY = 'adlo_store_profile_v1';

/**
 * 業態（v2，雙業態擴充）：
 * - 在地店家：GBP + LINE（原本唯一業態）
 * - 電商品牌：商品貼文 + LINE
 * - 實體+電商：GBP + 商品貼文 + LINE
 */
export type BusinessType = '在地店家' | '電商品牌' | '實體+電商';

export interface StoreProfile {
  storeName: string;
  industry: Industry;
  selectedTags: string[];
  weekTheme?: string;
  /** 業態。v1 舊紀錄沒有此欄，讀取時一律視為「在地店家」。 */
  businessType?: BusinessType;
  /** 銷售通路（型別預留，尚無 UI）。 */
  channels?: string[];
  /** ISO 字串，最後一次儲存時間 */
  savedAt: string;
}

export interface StoreProfileInput {
  storeName: string;
  industry: Industry;
  selectedTags: string[];
  weekTheme?: string;
  businessType?: BusinessType;
  channels?: string[];
}

const VALID_INDUSTRIES: Industry[] = [
  '餐飲', '美髮美容', '醫美', '牙科', '律師', '補教', '零售', '其他',
];

const VALID_BUSINESS_TYPES: BusinessType[] = [
  '在地店家', '電商品牌', '實體+電商',
];

function isValidProfile(value: unknown): value is StoreProfile {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  // 注意：businessType / channels 為 v2 新欄位，缺少或格式不符都不影響有效性
  // （v1 舊紀錄向下相容），讀取時由 normalizeProfile 補預設值。
  return (
    typeof v.storeName === 'string' &&
    v.storeName.trim().length >= 2 &&
    typeof v.industry === 'string' &&
    VALID_INDUSTRIES.includes(v.industry as Industry) &&
    Array.isArray(v.selectedTags) &&
    v.selectedTags.every((t) => typeof t === 'string')
  );
}

/** v1 → v2 讀取時正規化：舊紀錄沒 businessType 一律視為「在地店家」。 */
function normalizeProfile(profile: StoreProfile): StoreProfile {
  const v = profile as StoreProfile & Record<string, unknown>;
  const businessType: BusinessType = VALID_BUSINESS_TYPES.includes(
    v.businessType as BusinessType,
  )
    ? (v.businessType as BusinessType)
    : '在地店家';
  const channels =
    Array.isArray(v.channels) && v.channels.every((c) => typeof c === 'string')
      ? (v.channels as string[])
      : undefined;
  return { ...profile, businessType, channels };
}

function parseRaw(raw: string | null): StoreProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValidProfile(parsed) ? normalizeProfile(parsed) : null;
  } catch {
    return null;
  }
}

// ── 一次性讀寫 API ──────────────────────────────────────────

/** 讀取本機店家檔案；沒有或格式壞掉回 null。 */
export function getStoreProfile(): StoreProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseRaw(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** 儲存店家檔案到本機。回傳寫入後的完整 profile。 */
export function saveStoreProfile(input: StoreProfileInput): StoreProfile {
  const profile: StoreProfile = {
    storeName: input.storeName.trim(),
    industry: input.industry,
    selectedTags: input.selectedTags.map((t) => t.trim()).filter(Boolean),
    weekTheme: input.weekTheme?.trim() || undefined,
    businessType:
      input.businessType && VALID_BUSINESS_TYPES.includes(input.businessType)
        ? input.businessType
        : '在地店家',
    channels: input.channels
      ?.map((c) => c.trim())
      .filter(Boolean),
    savedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // localStorage 滿了 / 隱私模式 — 靜默失敗，畫面仍可用當次資料
    }
  }
  emit();
  return profile;
}

/** 清除本機店家檔案。 */
export function clearStoreProfile(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  emit();
}

// ── useSyncExternalStore 相容 API ───────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedRaw: string | null | undefined; // undefined = 尚未讀取
let cachedSnapshot: StoreProfile | null = null;

function emit() {
  cachedRaw = undefined; // 失效，下次 getSnapshot 重算
  listeners.forEach((l) => l());
}

export function subscribeStoreProfile(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) emit();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

/** 回傳穩定參考（同一份 raw → 同一個物件），避免 useSyncExternalStore 無限重繪。 */
export function getStoreProfileSnapshot(): StoreProfile | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = parseRaw(raw);
  return cachedSnapshot;
}

/** SSR / hydration 首幀一律當作「尚無檔案」。 */
export function getStoreProfileServerSnapshot(): StoreProfile | null {
  return null;
}
