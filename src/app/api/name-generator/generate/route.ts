import { NextRequest, NextResponse } from 'next/server';
import { generateNamesViaGroq, type NameGeneratorInput } from '@/lib/groq';
import { checkRateLimit, incrementRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TOOL = 'name-generator';

const VALID_STYLES = [
  '溫馨親切',
  '專業可信',
  '趣味活潑',
  '文青小清新',
  '潮流現代',
] as const;

interface RequestBody {
  industry?: string;
  style?: string;
  target?: string;
  keywords?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const industry = (body.industry ?? '').trim();
    const style = (body.style ?? '').trim();
    const target = (body.target ?? '').trim();
    const keywords = (body.keywords ?? '').trim();

    if (industry.length < 2) {
      return NextResponse.json({ error: '請選擇產業類別' }, { status: 400 });
    }
    if (!VALID_STYLES.includes(style as (typeof VALID_STYLES)[number])) {
      return NextResponse.json({ error: '請選擇品牌風格' }, { status: 400 });
    }
    if (target.length < 4 || target.length > 60) {
      return NextResponse.json(
        { error: '客群描述請輸入 4–60 字' },
        { status: 400 },
      );
    }
    if (keywords.length > 60) {
      return NextResponse.json(
        { error: '關鍵字請在 60 字以內' },
        { status: 400 },
      );
    }

    const ip = getClientIp(req.headers);

    // Rate limit check
    let rl;
    try {
      rl = await checkRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/name-generator] rate limit Redis 失敗，放行', err);
      rl = { allowed: true, count: 0, limit: 3, resetAt: 0, emailUnlocked: false };
    }

    if (!rl.allowed) {
      const resetMins = Math.ceil((rl.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: 'RATE_LIMIT',
          message: `今日免費次數已用完（${rl.limit} 次），${resetMins} 分鐘後重置。留 email 可解鎖更多次數。`,
          quota: { count: rl.count, limit: rl.limit, emailUnlocked: rl.emailUnlocked },
        },
        { status: 429 },
      );
    }

    const input: NameGeneratorInput = {
      industry,
      style,
      target,
      keywords: keywords || undefined,
    };

    const { result, tokensUsed } = await generateNamesViaGroq(input);

    // Increment rate limit after successful call
    try {
      await incrementRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/name-generator] rate limit increment 失敗', err);
    }

    console.info(
      `[name-generator] OK ip=${ip} tokens=${tokensUsed} industry=${industry}`,
    );

    return NextResponse.json({
      ...result,
      quota: {
        count: rl.count + 1,
        limit: rl.limit,
        emailUnlocked: rl.emailUnlocked,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[api/name-generator] 內部錯誤', msg);
    return NextResponse.json(
      { error: 'INTERNAL', message: '產生失敗，請稍後再試' },
      { status: 500 },
    );
  }
}
