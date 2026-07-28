import 'server-only';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  resetAt: number;
  emailUnlocked: boolean;
}

const DEFAULT_LIMIT = 3;
const UNLOCKED_LIMIT = 10;
const WINDOW_SECONDS = 60 * 60 * 24; // 24h

/**
 * Sliding window rate limit keyed by client IP.
 * - 預設 3 次 / 24h
 * - 若該 IP 已留 email（unlock），升為 10 次 / 24h
 */
export async function checkRateLimit(
  ip: string,
  tool: string = 'check',
): Promise<RateLimitResult> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  const countKey = `adlo:${tool}:ip:${normalizedIp}:count`;
  const unlockKey = `adlo:${tool}:ip:${normalizedIp}:unlocked`;

  const [currentCount, unlocked] = await Promise.all([
    redis.get<number>(countKey),
    redis.get<string>(unlockKey),
  ]);

  const emailUnlocked = unlocked === '1';
  const limit = emailUnlocked ? UNLOCKED_LIMIT : DEFAULT_LIMIT;
  const count = currentCount ?? 0;

  const ttl = await redis.ttl(countKey);
  const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : WINDOW_SECONDS * 1000);

  return {
    allowed: count < limit,
    count,
    limit,
    resetAt,
    emailUnlocked,
  };
}

/** 成功查詢後呼叫，遞增計數 */
export async function incrementRateLimit(
  ip: string,
  tool: string = 'check',
): Promise<void> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  const countKey = `adlo:${tool}:ip:${normalizedIp}:count`;
  const next = await redis.incr(countKey);
  if (next === 1) {
    await redis.expire(countKey, WINDOW_SECONDS);
  }
}

/** Email gate 解鎖：記錄 unlocked 30 天，把當日上限由 3 提升為 10
 *
 * ⚠️ 這裡刻意「不」清零 countKey。舊版會 `redis.set(countKey, 0)`，
 * 造成無限繞過：用完 3 次 → 隨便填 email 解鎖 → 計數歸零 → 再用 10 次
 * → 再解鎖一次 → 又歸零…（email 不需驗證，同一個可重複使用）。
 * 攻擊者可藉此把全站 Places / Groq 額度打光，工具對真實訪客整天 429。
 *
 * 正確語意（與檔頭註解一致）：解鎖後是「10 次 / 24h 總額」，
 * 不是「再送 10 次」。已用掉的次數繼續計入。
 */
export async function unlockEmailGate(
  ip: string,
  email: string,
  tool: string = 'check',
): Promise<void> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  const unlockKey = `adlo:${tool}:ip:${normalizedIp}:unlocked`;
  const emailKey = `adlo:${tool}:ip:${normalizedIp}:email`;

  await Promise.all([
    redis.set(unlockKey, '1', { ex: 60 * 60 * 24 * 30 }), // 30 days
    redis.set(emailKey, email, { ex: 60 * 60 * 24 * 30 }),
  ]);
}

/** 從 NextRequest headers 解析 client IP（Vercel / Cloudflare / 一般 proxy）
 *
 * 優先順序（2026-04-29 修正）：
 * 1. `cf-connecting-ip` — Cloudflare 直接告知的真實 client IP（最可信）
 * 2. `x-vercel-forwarded-for` — Vercel 自家平台 header
 * 3. `x-real-ip` — 一般反代設定
 * 4. `x-forwarded-for` 第一個值 — 鏈式 proxy 場景的標準 fallback
 *
 * ❌ 舊版錯誤：把 `x-forwarded-for` 第一個放最前面，但 Vercel + Cloudflare
 * 環境下，那欄位的第一個值是 CF edge IP（172.71.x / 104.22.x 等），
 * 導致每個 burst request 都拿到不同 CF POP IP，rate-limit 跟 burst
 * counter 都失效（每次「不同人」進來）。
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-vercel-forwarded-for') ??
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

// ── Admin 登入防爆破 ────────────────────────────────────────────────
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 60 * 15; // 15 分鐘

export interface LoginAttemptResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** 檢查該 IP 是否還能嘗試登入（不遞增）。
 *  Redis 失敗時 fail-closed：拒絕登入。
 *  理由：/admin 是後台入口，Redis 掛掉時「擋住登入」的代價遠低於
 *  「開放無限嘗試」。這與免費工具的 fail-open 取捨相反，是刻意的。
 */
export async function checkLoginAttempts(ip: string): Promise<LoginAttemptResult> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  const key = `adlo:admin:login-fail:${normalizedIp}`;

  const [count, ttl] = await Promise.all([
    redis.get<number>(key),
    redis.ttl(key),
  ]);
  const attempts = count ?? 0;

  return {
    allowed: attempts < LOGIN_MAX_ATTEMPTS,
    remaining: Math.max(0, LOGIN_MAX_ATTEMPTS - attempts),
    retryAfterSeconds: ttl > 0 ? ttl : LOGIN_WINDOW_SECONDS,
  };
}

/** 登入失敗後呼叫，遞增失敗計數 */
export async function recordLoginFailure(ip: string): Promise<void> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  const key = `adlo:admin:login-fail:${normalizedIp}`;
  const next = await redis.incr(key);
  if (next === 1) await redis.expire(key, LOGIN_WINDOW_SECONDS);
}

/** 登入成功後呼叫，清除失敗計數 */
export async function clearLoginFailures(ip: string): Promise<void> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  await redis.del(`adlo:admin:login-fail:${normalizedIp}`);
}
