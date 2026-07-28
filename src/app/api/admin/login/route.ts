import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import {
  checkLoginAttempts,
  recordLoginFailure,
  clearLoginFailures,
  getClientIp,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';

/** 定時比較，避免以回應時間逐字元推敲密碼。
 *  長度不同時 timingSafeEqual 會 throw，故先確保兩邊等長再比。
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // 仍執行一次等長比較，避免長度差異本身成為旁通道
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;

  // fail-closed：ADMIN_SECRET 未設定時一律拒絕。
  // 舊版直接比 `password !== process.env.ADMIN_SECRET`，env 漏設時
  // `undefined !== undefined` 為 false → 空 body 即可登入並取得 cookie。
  if (!secret) {
    console.error('[admin/login] ADMIN_SECRET 未設定，拒絕所有登入');
    return NextResponse.json({ error: '系統未正確設定' }, { status: 503 });
  }

  const ip = getClientIp(request.headers);

  // 防爆破：15 分鐘內最多 5 次失敗。
  // Redis 失敗時 fail-closed（拒絕登入）——與免費工具的 fail-open 取捨相反，
  // 這是刻意的：後台入口寧可暫時進不去，也不要開放無限次密碼嘗試。
  let attempts;
  try {
    attempts = await checkLoginAttempts(ip);
  } catch (err) {
    console.error('[admin/login] Redis 失敗，拒絕登入（fail-closed）', err);
    return NextResponse.json({ error: '暫時無法驗證，請稍後再試' }, { status: 503 });
  }

  if (!attempts.allowed) {
    console.warn('[admin/login] 嘗試次數過多', { ip, retryAfter: attempts.retryAfterSeconds });
    return NextResponse.json(
      { error: '嘗試次數過多，請稍後再試', retryAfterSeconds: attempts.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(attempts.retryAfterSeconds) } },
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
  }

  if (typeof password !== 'string' || !safeCompare(password, secret)) {
    await recordLoginFailure(ip).catch((err) =>
      console.error('[admin/login] 記錄失敗次數時出錯', err),
    );
    return NextResponse.json(
      { error: '密碼錯誤', remaining: Math.max(0, attempts.remaining - 1) },
      { status: 401 },
    );
  }

  await clearLoginFailures(ip).catch((err) =>
    console.error('[admin/login] 清除失敗次數時出錯', err),
  );

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_token', secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });
  return response;
}
