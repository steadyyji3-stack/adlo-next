import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerRankings } from '@/lib/customer-dashboard';

export async function GET() {
  const customerId = await getCustomerIdFromRequest();
  if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

  try {
    const rankings = await listCustomerRankings(customerId);
    return apiOk({ rankings });
  } catch (error) {
    console.error('[Customer Dashboard] rankings failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_RANKINGS_FAILED', '讀取排名資料失敗', 500);
  }
}
