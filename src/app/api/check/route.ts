import { NextRequest, NextResponse } from 'next/server';
import { fetchGBP, PlacesApiUnavailableError } from '@/lib/places';
import { computeScore } from '@/lib/scoring';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import { checkCostCap, incrementCostCap } from '@/lib/cost-cap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckRequestBody {
  query?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: CheckRequestBody;
    try {
      body = (await req.json()) as CheckRequestBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const query = (body.query ?? '').trim();
    const isUrl = /^https?:\/\//i.test(query);
    // 純文字限 2–80 字；Google Maps URL 放寬到 500 字（完整 URL 通常 200+ 字）
    const tooShort = query.length < 2;
    const tooLong = isUrl ? query.length > 500 : query.length > 80;
    if (!query || tooShort || tooLong) {
      return NextResponse.json(
        { error: '請輸入店家名稱、地址，或 Google 地圖網址' },
        { status: 400 },
      );
    }

    const ip = getClientIp(req.headers);
    const userAgent = req.headers.get('user-agent') ?? '';

    // 1. Cost cap 預檢（UA filter / IP burst / 全站日 / 全站月）
    //    最便宜的擋在前面，避免浪費後續 Redis call 與 Places API quota
    const cap = await checkCostCap(ip, userAgent);
    if (!cap.allowed) {
      const status = cap.reason === 'BOT_UA' ? 403 : 429;
      return NextResponse.json(
        {
          error: cap.reason,
          message: cap.message,
        },
        { status },
      );
    }

    // 2. 個別 IP 速率限制（Redis 失敗 → 放行不阻擋用戶）
    let rl;
    try {
      rl = await checkRateLimit(ip);
    } catch (err) {
      console.error('[api/check] rate limit Redis 失敗，放行', err);
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
            ? '今日查詢已達 10 次上限，請明天再試'
            : '今日免費查詢已用完，留個 email 再查 10 次',
          limit: rl.limit,
          count: rl.count,
          resetAt: rl.resetAt,
          emailUnlocked: rl.emailUnlocked,
        },
        { status: 429 },
      );
    }

    // 3. 抓 GBP → 4. 算分
    const snap = await fetchGBP(query);
    const result = computeScore(snap);

    // 5. 成功後才遞增 IP 計數 + 全站計數（失敗不扣額度）
    try {
      await Promise.all([incrementRateLimit(ip), incrementCostCap()]);
    } catch (err) {
      console.error('[api/check] increment 失敗（忽略，不影響回傳）', err);
    }

    return NextResponse.json({
      storeName: snap.name,
      location: snap.location,
      score: result.score,
      breakdown: result.breakdown,
      weakestMetric: result.weakestMetric,
      regionRankPercent: result.regionRankPercent,
      quota: {
        count: rl.count + 1,
        limit: rl.limit,
        emailUnlocked: rl.emailUnlocked,
      },
    });
  } catch (err) {
    // Places API 服務未配置 → 503，不消耗用戶額度
    if (err instanceof PlacesApiUnavailableError) {
      console.warn('[api/check] GOOGLE_PLACES_API_KEY 未設定');
      return NextResponse.json(
        {
          error: 'SERVICE_UNAVAILABLE',
          message:
            '健檢服務正在升級中，預計 24 小時內恢復。已在路上，先用 Google 商家搜尋你的店家確認資料完整度。',
        },
        { status: 503 },
      );
    }
    // Top-level safety net — 任何未預期錯誤都回 JSON，避免 Vercel 回空 500
    console.error('[api/check] 未預期錯誤', err);
    return NextResponse.json(
      {
        error: 'INTERNAL',
        message: '查詢失敗，請稍後再試',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
