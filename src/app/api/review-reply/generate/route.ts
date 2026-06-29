import { NextRequest, NextResponse } from 'next/server';
import { generateReviewRepliesViaGroq, type ReviewReplyInput } from '@/lib/groq';
import { checkRateLimit, incrementRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TOOL = 'review-reply';

interface RequestBody {
  rating?: number;
  reviewText?: string;
  industry?: string;
  ownerNote?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const rating = Number(body.rating);
    const reviewText = (body.reviewText ?? '').trim();
    const industry = (body.industry ?? '').trim();
    const ownerNote = (body.ownerNote ?? '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '請選擇 1–5 星' }, { status: 400 });
    }
    if (reviewText.length < 5 || reviewText.length > 500) {
      return NextResponse.json(
        { error: '請貼上評論內容（5–500 字）' },
        { status: 400 },
      );
    }
    if (industry.length > 20) {
      return NextResponse.json({ error: '店家類型請在 20 字以內' }, { status: 400 });
    }
    if (ownerNote.length > 150) {
      return NextResponse.json({ error: '補充說明請在 150 字以內' }, { status: 400 });
    }

    const ip = getClientIp(req.headers);

    let rl;
    try {
      rl = await checkRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/review-reply] rate limit Redis 失敗，放行', err);
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

    const input: ReviewReplyInput = {
      rating,
      reviewText,
      industry: industry || undefined,
      ownerNote: ownerNote || undefined,
    };

    const { result, tokensUsed } = await generateReviewRepliesViaGroq(input);

    try {
      await incrementRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/review-reply] rate limit increment 失敗', err);
    }

    console.info(`[review-reply] OK ip=${ip} tokens=${tokensUsed} rating=${rating}`);

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
    console.error('[api/review-reply] 內部錯誤', msg);
    return NextResponse.json(
      { error: 'INTERNAL', message: '產生失敗，請稍後再試' },
      { status: 500 },
    );
  }
}
