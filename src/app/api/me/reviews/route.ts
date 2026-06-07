import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerReviews } from '@/lib/customer-dashboard';

export async function GET() {
  const customerId = await getCustomerIdFromRequest();
  if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

  try {
    const reviews = await listCustomerReviews(customerId);
    return apiOk({ reviews });
  } catch (error) {
    console.error('[Customer Dashboard] reviews failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_REVIEWS_FAILED', '讀取評論資料失敗', 500);
  }
}
