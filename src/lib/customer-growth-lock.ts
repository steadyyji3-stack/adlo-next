import 'server-only';

import { randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';

const LOCK_SECONDS = 40;
const RELEASE_SCRIPT = `
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
end
return 0
`;

export type GrowthGenerationLease =
  | { status: 'acquired'; release: () => Promise<void> }
  | { status: 'busy' }
  | { status: 'unavailable' };

export async function acquireGrowthGenerationLease(
  customerId: string,
  weekStart: string,
): Promise<GrowthGenerationLease> {
  const redis = growthRedis();
  if (!redis) {
    if (process.env.NODE_ENV === 'production') return { status: 'unavailable' };
    return { status: 'acquired', release: async () => undefined };
  }

  const key = `adlo:track-b:growth-lock:${customerId}:${weekStart}`;
  const token = randomUUID();

  try {
    const result = await redis.set(key, token, { nx: true, ex: LOCK_SECONDS });
    if (result !== 'OK') return { status: 'busy' };

    return {
      status: 'acquired',
      release: async () => {
        try {
          await redis.eval<[string], number>(RELEASE_SCRIPT, [key], [token]);
        } catch {
          console.error(`[GrowthCycle] lease release failed customer=${customerId} week=${weekStart}`);
        }
      },
    };
  } catch {
    console.error(`[GrowthCycle] lease unavailable customer=${customerId} week=${weekStart}`);
    return { status: 'unavailable' };
  }
}

function growthRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}
