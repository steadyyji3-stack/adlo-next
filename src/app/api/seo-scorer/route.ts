import { NextRequest, NextResponse } from 'next/server';
import { scoreUrl, SeoFetchError } from '@/lib/seo-scorer';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import { checkCostCap } from '@/lib/cost-cap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 20;

const TOOL = 'seo-scorer';

interface AnalyzeBody {
  url?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: AnalyzeBody;
    try {
      body = (await req.json()) as AnalyzeBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const url = (body.url ?? '').trim();
    if (!url) {
      return NextResponse.json({ error: '請輸入文章 URL' }, { status: 400 });
    }
    if (url.length > 500) {
      return NextResponse.json({ error: 'URL 太長' }, { status: 400 });
    }

    const ip = getClientIp(req.headers);
    const userAgent = req.headers.get('user-agent') ?? '';

    // 0. UA + IP burst（seo-scorer 不消耗 Places 預算，自動跳過 global cap）
    const cap = await checkCostCap(ip, userAgent, TOOL);
    if (!cap.allowed) {
      return NextResponse.json(
        { error: cap.reason, message: cap.message },
        { status: cap.reason === 'BOT_UA' ? 403 : 429 },
      );
    }

    // 1. IP daily
    let rl;
    try {
      rl = await checkRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/seo-scorer] rate-limit Redis 失敗，放行', err);
      rl = {
        allowed: true,
        count: 0,
        limit: 3,
        resetAt: Date.now() + 86400000,
        emailUnlocked: false,
      };
    }
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT',
          message: rl.emailUnlocked
            ? '今日已達 10 次，請明天再試'
            : '今日免費已用完，留個 email 再用 10 次',
          limit: rl.limit,
          count: rl.count,
          resetAt: rl.resetAt,
          emailUnlocked: rl.emailUnlocked,
        },
        { status: 429 },
      );
    }

    // 2. 抓 HTML + 算分
    const report = await scoreUrl(url);

    // 3. 成功才扣額度
    try {
      await incrementRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/seo-scorer] increment 失敗（忽略）', err);
    }

    return NextResponse.json({
      ...report,
      quota: {
        count: rl.count + 1,
        limit: rl.limit,
        emailUnlocked: rl.emailUnlocked,
      },
    });
  } catch (err) {
    if (err instanceof SeoFetchError) {
      const status =
        err.reason === 'INVALID_URL' || err.reason === 'BLOCKED_HOST' || err.reason === 'TOO_LARGE'
          ? 400
          : 502;
      return NextResponse.json(
        { error: err.reason, message: err.message },
        { status },
      );
    }
    console.error('[api/seo-scorer] 未預期錯誤', err);
    return NextResponse.json(
      {
        error: 'INTERNAL',
        message: '分析失敗，請稍後再試',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
