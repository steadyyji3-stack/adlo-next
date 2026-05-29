import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { createGbpInsight, listAdminGbpInsights, summarizeGbpInsights } from '@/lib/gbp-insights';

const insightCreateSchema = z.object({
  customer_id: z.string().uuid(),
  date: z.string().date(),
  business_impressions: z.number().int().min(0).default(0),
  website_clicks: z.number().int().min(0).default(0),
  phone_calls: z.number().int().min(0).default(0),
  direction_requests: z.number().int().min(0).default(0),
  messages: z.number().int().min(0).default(0),
  source: z.enum(['manual', 'gbp_api', 'imported']).default('manual'),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const insights = await listAdminGbpInsights({
      customerId: request.nextUrl.searchParams.get('customer_id') ?? undefined,
    });
    return apiOk({ insights, summary: summarizeGbpInsights(insights) });
  } catch (error) {
    console.error('[Admin GBP Insights] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('GBP_INSIGHTS_LIST_FAILED', '讀取 GBP 洞察失敗', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const parsed = insightCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? 'GBP 洞察格式錯誤', 400);
    }

    const insight = await createGbpInsight({
      customerId: parsed.data.customer_id,
      date: parsed.data.date,
      businessImpressions: parsed.data.business_impressions,
      websiteClicks: parsed.data.website_clicks,
      phoneCalls: parsed.data.phone_calls,
      directionRequests: parsed.data.direction_requests,
      messages: parsed.data.messages,
      source: parsed.data.source,
    });

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'gbp_insight.create',
      targetType: 'gbp_insight',
      targetId: insight.id,
      payload: {
        customer_id: insight.customer_id,
        date: insight.date,
        business_impressions: insight.business_impressions,
        website_clicks: insight.website_clicks,
        phone_calls: insight.phone_calls,
        direction_requests: insight.direction_requests,
        messages: insight.messages,
        source: insight.source,
      },
    });

    return apiOk({ insight }, 201);
  } catch (error) {
    console.error('[Admin GBP Insights] create failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('GBP_INSIGHT_CREATE_FAILED', '新增 GBP 洞察失敗', 500);
  }
}
