import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { listAdminGbpReviews } from '@/lib/gbp-reviews';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const customerId = request.nextUrl.searchParams.get('customer_id') ?? undefined;
    const replyStatus = request.nextUrl.searchParams.get('reply_status') ?? undefined;
    const unanswered = request.nextUrl.searchParams.get('unanswered') === 'true';
    const reviews = await listAdminGbpReviews({ customerId, replyStatus, unanswered });
    return apiOk({ reviews });
  } catch (error) {
    console.error('[Admin Reviews] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEWS_LIST_FAILED', '讀取 GBP 評論清單失敗', 500);
  }
}
