import 'server-only';
import { Redis } from '@upstash/redis';
import { Submission } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY = 'adlo:submissions';

export async function readSubmissions(): Promise<Submission[]> {
  try {
    const data = await redis.get<Submission[]>(KEY);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function writeSubmissions(submissions: Submission[]): Promise<void> {
  await redis.set(KEY, submissions);
}
