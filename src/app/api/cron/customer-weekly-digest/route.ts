import { timingSafeEqual } from 'node:crypto';
import { runCustomerWeeklyDigest } from '@/lib/customer-weekly-digest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const result = await runCustomerWeeklyDigest();
    return Response.json(
      { ok: result.failed === 0, ...result },
      { status: result.failed === 0 ? 200 : 500 },
    );
  } catch {
    console.error('[WeeklyDigest] cron run failed');
    return Response.json(
      { ok: false, error: { code: 'WEEKLY_DIGEST_FAILED' } },
      { status: 500 },
    );
  }
}

function hasValidCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  if (!secret || !authorization?.startsWith('Bearer ')) return false;

  const expected = Buffer.from(secret);
  const actual = Buffer.from(authorization.slice('Bearer '.length));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
