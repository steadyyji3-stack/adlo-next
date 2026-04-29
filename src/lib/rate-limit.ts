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

/** Email gate 解鎖：記錄 unlocked 30 天 + 清零當前視窗計數 */
export async function unlockEmailGate(
  ip: string,
  email: string,
  tool: string = 'check',
): Promise<void> {
  const normalizedIp = ip.replace(/[^\d.:a-fA-F]/g, '').slice(0, 64) || 'unknown';
  const unlockKey = `adlo:${tool}:ip:${normalizedIp}:unlocked`;
  const countKey = `adlo:${tool}:ip:${normalizedIp}:count`;
  const emailKey = `adlo:${tool}:ip:${normalizedIp}:email`;

  await Promise.all([
    redis.set(unlockKey, '1', { ex: 60 * 60 * 24 * 30 }), // 30 days
    redis.set(emailKey, email, { ex: 60 * 60 * 24 * 30 }),
    redis.set(countKey, 0, { ex: WINDOW_SECONDS }),
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
