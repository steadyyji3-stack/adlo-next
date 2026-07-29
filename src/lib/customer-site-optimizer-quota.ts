import 'server-only';

import { Redis } from '@upstash/redis';

const DAILY_LIMIT = 5;
const DAY_SECONDS = 60 * 60 * 24;

export interface SiteOptimizerQuota {
  allowed: boolean;
  count: number;
  limit: number;
  resetAt: number;
}

export async function reserveSiteOptimizerQuota(customerId: string): Promise<SiteOptimizerQuota> {
  const redis = siteOptimizerRedis();
  const key = `adlo:paid:site-optimizer:customer:${customerId}:count`;
  const next = await redis.incr(key);

  if (next === 1) {
    try {
      await redis.expire(key, DAY_SECONDS);
    } catch (error) {
      await redis.del(key).catch(() => undefined);
      throw error;
    }
  }

  const ttl = await redis.ttl(key);
  if (next > DAILY_LIMIT) {
    await redis.decr(key).catch(() => undefined);
    return quotaResult(false, DAILY_LIMIT, ttl);
  }
  return quotaResult(true, next, ttl);
}

function quotaResult(allowed: boolean, count: number, ttl: number): SiteOptimizerQuota {
  return {
    allowed,
    count,
    limit: DAILY_LIMIT,
    resetAt: Date.now() + (ttl > 0 ? ttl * 1_000 : DAY_SECONDS * 1_000),
  };
}

function siteOptimizerRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Upstash Redis environment variables are not configured');
  return new Redis({ url, token });
}
