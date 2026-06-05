import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { getCustomerSubscriptionSnapshot } from '@/lib/customer-billing';

export async function GET() {
  const customerId = await getCustomerIdFromRequest();
  if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

  try {
    const snapshot = await getCustomerSubscriptionSnapshot(customerId);
    if (!snapshot) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    return apiOk(snapshot);
  } catch (error) {
    console.error('[Customer Dashboard] subscription failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_SUBSCRIPTION_FAILED', '讀取訂閱資料失敗', 500);
  }
}
