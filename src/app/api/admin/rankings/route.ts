import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { createKeywordRanking, listAdminKeywordRankings, summarizeLatestRankings } from '@/lib/keyword-rankings';

const rankingCreateSchema = z.object({
  customer_id: z.string().uuid(),
  keyword: z.string().trim().min(1).max(120),
  rank_position: z.number().int().min(1).max(100).nullable().optional(),
  search_volume: z.number().int().min(0).nullable().optional(),
  cpc_ntd: z.number().min(0).nullable().optional(),
  checked_at: z.string().datetime(),
  source: z.enum(['google_search', 'serp_api']).default('google_search'),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const customerId = request.nextUrl.searchParams.get('customer_id') ?? undefined;
    const keyword = request.nextUrl.searchParams.get('keyword') ?? undefined;
    const rankings = await listAdminKeywordRankings({ customerId, keyword });
    return apiOk({ rankings, summary: summarizeLatestRankings(rankings) });
  } catch (error) {
    console.error('[Admin Rankings] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('RANKINGS_LIST_FAILED', '讀取關鍵字排名失敗', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const parsed = rankingCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '排名資料格式錯誤', 400);
    }

    const ranking = await createKeywordRanking({
      customerId: parsed.data.customer_id,
      keyword: parsed.data.keyword,
      rankPosition: parsed.data.rank_position,
      searchVolume: parsed.data.search_volume,
      cpcNtd: parsed.data.cpc_ntd,
      checkedAt: parsed.data.checked_at,
      source: parsed.data.source,
    });

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'keyword_ranking.create',
      targetType: 'keyword_ranking',
      targetId: ranking.id,
      payload: {
        customer_id: ranking.customer_id,
        keyword: ranking.keyword,
        rank_position: ranking.rank_position,
        source: ranking.source,
        checked_at: ranking.checked_at,
      },
    });

    return apiOk({ ranking }, 201);
  } catch (error) {
    console.error('[Admin Rankings] create failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('RANKING_CREATE_FAILED', '新增關鍵字排名失敗', 500);
  }
}
