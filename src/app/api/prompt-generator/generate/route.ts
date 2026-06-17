import { NextRequest, NextResponse } from 'next/server';
import { generatePromptViaGroq, type PromptGeneratorInput } from '@/lib/groq';
import { checkRateLimit, incrementRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TOOL = 'prompt-generator';

const VALID_USE_CASES = [
  '行銷文案',
  '社群貼文',
  '客服回覆',
  'Email / 通知',
  'SEO 內容',
  '翻譯 / 潤稿',
  '資料整理分析',
  '其他',
] as const;

const VALID_TONES = ['親切口語', '專業正式', '活潑有趣', '簡潔直接'] as const;
const VALID_PLATFORMS = ['ChatGPT', 'Claude', 'Gemini', '不確定'] as const;

interface RequestBody {
  task?: string;
  useCase?: string;
  tone?: string;
  platform?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const task = (body.task ?? '').trim();
    const useCase = (body.useCase ?? '').trim();
    const tone = (body.tone ?? '').trim();
    const platform = (body.platform ?? '').trim();

    if (task.length < 6 || task.length > 300) {
      return NextResponse.json(
        { error: '請描述你想做的事（6–300 字）' },
        { status: 400 },
      );
    }
    if (!VALID_USE_CASES.includes(useCase as (typeof VALID_USE_CASES)[number])) {
      return NextResponse.json({ error: '請選擇用途場景' }, { status: 400 });
    }
    if (tone && !VALID_TONES.includes(tone as (typeof VALID_TONES)[number])) {
      return NextResponse.json({ error: '語氣選項無效' }, { status: 400 });
    }
    if (platform && !VALID_PLATFORMS.includes(platform as (typeof VALID_PLATFORMS)[number])) {
      return NextResponse.json({ error: '平台選項無效' }, { status: 400 });
    }

    const ip = getClientIp(req.headers);

    // Rate limit check
    let rl;
    try {
      rl = await checkRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/prompt-generator] rate limit Redis 失敗，放行', err);
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

    const input: PromptGeneratorInput = {
      task,
      useCase,
      tone: tone || undefined,
      platform: platform || undefined,
    };

    const { result, tokensUsed } = await generatePromptViaGroq(input);

    // Increment rate limit after successful call
    try {
      await incrementRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/prompt-generator] rate limit increment 失敗', err);
    }

    console.info(
      `[prompt-generator] OK ip=${ip} tokens=${tokensUsed} useCase=${useCase}`,
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
    console.error('[api/prompt-generator] 內部錯誤', msg);
    return NextResponse.json(
      { error: 'INTERNAL', message: '產生失敗，請稍後再試' },
      { status: 500 },
    );
  }
}
