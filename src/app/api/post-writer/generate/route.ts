import { NextRequest, NextResponse } from 'next/server';
import {
  generatePosts,
  type Industry,
  type PostWriterInput,
} from '@/lib/gbp-post-writer';
import {
  checkRateLimit,
  incrementRateLimit,
  getClientIp,
} from '@/lib/rate-limit';
import { checkCostCap } from '@/lib/cost-cap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL = 'post-writer';
const VALID_INDUSTRIES: Industry[] = [
  '餐飲', '美髮美容', '醫美', '牙科', '律師', '補教', '零售', '其他',
  '裝潢', '裝修', '安裝', '維修',
];

interface GenerateBody {
  storeName?: string;
  industry?: string;
  weekTheme?: string;
  selectedTags?: string[];
}

export async function POST(req: NextRequest) {
  try {
    let body: GenerateBody;
    try {
      body = (await req.json()) as GenerateBody;
    } catch {
      return NextResponse.json({ error: '無效的請求格式' }, { status: 400 });
    }

    const storeName = (body.storeName ?? '').trim();
    const industryRaw = (body.industry ?? '').trim();
    const weekTheme = (body.weekTheme ?? '').trim();
    const selectedTags = Array.isArray(body.selectedTags)
      ? body.selectedTags.map((t) => String(t ?? '').trim()).filter(Boolean)
      : [];

    if (storeName.length < 2 || storeName.length > 40) {
      return NextResponse.json(
        { error: '店名請輸入 2–40 字' },
        { status: 400 },
      );
    }
    if (!VALID_INDUSTRIES.includes(industryRaw as Industry)) {
      return NextResponse.json({ error: '產業類別不正確' }, { status: 400 });
    }
    if (weekTheme.length > 60) {
      return NextResponse.json(
        { error: '本週主打請在 60 字以內' },
        { status: 400 },
      );
    }
    if (selectedTags.length > 8) {
      return NextResponse.json(
        { error: '標籤最多勾 8 個' },
        { status: 400 },
      );
    }

    const input: PostWriterInput = {
      storeName,
      industry: industryRaw as Industry,
      weekTheme: weekTheme || undefined,
      selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
    };

    const ip = getClientIp(req.headers);
    const userAgent = req.headers.get('user-agent') ?? '';

    // 0. 防濫用（UA filter + IP burst）— 純 deterministic 也需要擋自動化流量
    const cap = await checkCostCap(ip, userAgent, 'post-writer');
    if (!cap.allowed) {
      return NextResponse.json(
        { error: cap.reason, message: cap.message },
        { status: cap.reason === 'BOT_UA' ? 403 : 429 },
      );
    }

    // 1. 速率限制（Redis 失敗 → 放行）
    let rl;
    try {
      rl = await checkRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/post-writer] rate limit Redis 失敗，放行', err);
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
            ? '今日產文已達 10 次上限，請明天再試'
            : '今日免費產文已用完，留個 email 再用 10 次',
          limit: rl.limit,
          count: rl.count,
          resetAt: rl.resetAt,
          emailUnlocked: rl.emailUnlocked,
        },
        { status: 429 },
      );
    }

    // 2. Deterministic 生成（不打 AI API、不會失敗）
    const posts = generatePosts(input);

    // 3. 遞增計數
    try {
      await incrementRateLimit(ip, TOOL);
    } catch (err) {
      console.error('[api/post-writer] increment 失敗（忽略）', err);
    }

    return NextResponse.json({
      posts,
      source: 'deterministic',
      quota: {
        count: rl.count + 1,
        limit: rl.limit,
        emailUnlocked: rl.emailUnlocked,
      },
    });
  } catch (err) {
    console.error('[api/post-writer] 未預期錯誤', err);
    return NextResponse.json(
      {
        error: 'INTERNAL',
        message: '產文失敗，請稍後再試',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
