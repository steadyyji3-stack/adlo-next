import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerReviews } from '@/lib/customer-dashboard';

export async function GET(request: NextRequest) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) return apiError('UNAUTHORIZED', '缺少 customer_id，請從 onboarding email 連結進入', 401);

  try {
    const reviews = await listCustomerReviews(customerId);
    return apiOk({ reviews });
  } catch (error) {
    console.error('[Customer Dashboard] reviews failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_REVIEWS_FAILED', '讀取評論資料失敗', 500);
  }
}
