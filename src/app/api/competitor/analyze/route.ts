import { NextRequest, NextResponse } from 'next/server';
import { fetchCompetitorReport } from '@/lib/competitor';
import { PlacesApiUnavailableError } from '@/lib/places';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import { checkCostCap, incrementCostCap } from '@/lib/cost-cap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TOOL = 'competitor';

interface AnalyzeBody {
  storeName?: string;
  keyword?: string;
  city?: string;
}

const VALID_CITIES = new Set([
  '台北', '新北', '桃園', '台中', '台南', '高雄',
  '基隆', '新竹', '其他',
]);

export async function POST(req: NextRequest) {
  try {
    let body: AnalyzeBody;
    try {
      body = (await req.json()) as AnalyzeBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const storeName = (body.storeName ?? '').trim();
    const keyword = (body.keyword ?? '').trim();
    const city = (body.city ?? '').trim();

    if (storeName.length < 2 || storeName.length > 40) {
      return NextResponse.json({ error: '店名請輸入 2–40 字' }, { status: 400 });
    }
    if (keyword.length < 2 || keyword.length > 30) {
      return NextResponse.json({ error: '關鍵字請輸入 2–30 字' }, { status: 400 });
    }
    if (!VALID_CITIES.has(city)) {
      return NextResponse.json({ error: '請選擇有效的城市' }, { status: 400 });
    }

    const ip = getClientIp(req.headers);
    const userAgent = req.headers.get('user-agent') ?? '';

    // 0. 防爆層（UA + burst + global cost-cap）
    const cap = await checkCostCap(ip, userAgent, TOOL);
    if (!cap.allowed) {
      return NextResponse.json(
        { error: cap.reason, message: cap.message },
        { status: cap.reason === 'BOT_UA' ? 403 : 429 },
      );
    }

    // 1. IP 速率限制
    let rl;
    try {
      rl = await checkRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/competitor] rate-limit Redis 失敗，放行', err);
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
            ? '今日比較已達 10 次上限，請明天再試'
            : '今日免費比較已用完，留個 email 再用 10 次',
          limit: rl.limit,
          count: rl.count,
          resetAt: rl.resetAt,
          emailUnlocked: rl.emailUnlocked,
        },
        { status: 429 },
      );
    }

    // 2. 真正打 Places API + 算分
    const report = await fetchCompetitorReport({ storeName, keyword, city });

    // 3. 成功才扣額度
    try {
      await Promise.all([incrementRateLimit(ip, TOOL), incrementCostCap()]);
    } catch (err) {
      console.error('[api/competitor] increment 失敗（忽略）', err);
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
    if (err instanceof PlacesApiUnavailableError) {
      console.warn('[api/competitor] GOOGLE_PLACES_API_KEY 未設定');
      return NextResponse.json(
        {
          error: 'SERVICE_UNAVAILABLE',
          message: '比較服務正在升級中，預計 24 小時內恢復。',
        },
        { status: 503 },
      );
    }
    if (err instanceof Error && err.message === 'NO_RESULTS') {
      return NextResponse.json(
        {
          error: 'NO_RESULTS',
          message:
            '這個關鍵字 + 城市組合在 Google 地圖上沒找到符合的店家。試試把關鍵字放寬，例如「越南麵包」改成「越南料理」或「麵包」。',
        },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === 'STORE_NOT_FOUND') {
      return NextResponse.json(
        {
          error: 'STORE_NOT_FOUND',
          message:
            '在 Google 地圖找不到你輸入的店名。請確認店名跟你的 Google 商家檔案上完全一致——多一個字、少一個店字、或括號內副標都會找不到。',
        },
        { status: 404 },
      );
    }
    console.error('[api/competitor] 未預期錯誤', err);
    return NextResponse.json(
      {
        error: 'INTERNAL',
        message: '比較失敗，請稍後再試',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
