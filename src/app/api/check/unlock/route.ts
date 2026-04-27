import { NextRequest, NextResponse } from 'next/server';
import { unlockEmailGate, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UnlockRequestBody {
  email?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: UnlockRequestBody;
  try {
    body = (await req.json()) as UnlockRequestBody;
  } catch {
    return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: '請輸入有效的 email 地址' }, { status: 400 });
  }

  const ip = getClientIp(req.headers);

  try {
    await unlockEmailGate(ip, email);
  } catch (err) {
    console.error('[api/check/unlock] Redis 寫入失敗', err);
    return NextResponse.json({ error: '解鎖失敗，請稍後再試' }, { status: 500 });
  }

  // TODO(Ada/Kael): 將 email 加入 MailerLite「adlo-check-L0」群組，觸發 onboarding 信
  // 目前先記錄到 server log，後續由 Ada 接 MailerLite MCP
  console.log('[api/check/unlock] 新解鎖 email', { email, ip });

  return NextResponse.json({
    ok: true,
    limit: 10,
    message: '已解鎖！現在你還有 10 次查詢',
  });
}
