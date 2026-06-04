import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { listAdminAdSpend, summarizeAdSpend, upsertAdSpendDaily, type AdSpendPlatform } from '@/lib/ad-spend';

const platformSchema = z.enum(['google_ads', 'meta_ads']);

const adSpendUpsertSchema = z.object({
  customer_id: z.string().uuid(),
  date: z.string().date(),
  platform: platformSchema,
  spend_ntd: z.number().min(0),
  impressions: z.number().int().min(0).nullable().optional(),
  clicks: z.number().int().min(0).nullable().optional(),
  conversions: z.number().int().min(0).nullable().optional(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const platformParam = request.nextUrl.searchParams.get('platform');
    const platform = platformParam && platformParam !== 'all' ? platformSchema.safeParse(platformParam) : null;
    const rows = await listAdminAdSpend({
      customerId: request.nextUrl.searchParams.get('customer_id') ?? undefined,
      platform: platform?.success ? platform.data as AdSpendPlatform : undefined,
    });
    return apiOk({ rows, summary: summarizeAdSpend(rows) });
  } catch (error) {
    console.error('[Admin Ad Spend] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('AD_SPEND_LIST_FAILED', '讀取廣告花費失敗', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const parsed = adSpendUpsertSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '廣告花費格式錯誤', 400);
    }

    const row = await upsertAdSpendDaily({
      customerId: parsed.data.customer_id,
      date: parsed.data.date,
      platform: parsed.data.platform,
      spendNtd: parsed.data.spend_ntd,
      impressions: parsed.data.impressions,
      clicks: parsed.data.clicks,
      conversions: parsed.data.conversions,
    });

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'ad_spend.upsert',
      targetType: 'ad_spend_daily',
      targetId: row.id,
      payload: {
        customer_id: row.customer_id,
        date: row.date,
        platform: row.platform,
        spend_ntd: row.spend_ntd,
        impressions: row.impressions,
        clicks: row.clicks,
        conversions: row.conversions,
      },
    });

    return apiOk({ row }, 201);
  } catch (error) {
    console.error('[Admin Ad Spend] upsert failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('AD_SPEND_UPSERT_FAILED', '儲存廣告花費失敗', 500);
  }
}
