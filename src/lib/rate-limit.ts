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

/** 從 NextRequest headers 解析 client IP（Vercel / Cloudflare / 一般 proxy） */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    headers.get('x-vercel-forwarded-for') ??
    'unknown'
  );
}
