import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { getCustomerDashboardData } from '@/lib/customer-dashboard';

export async function GET() {
  const customerId = await getCustomerIdFromRequest();
  if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

  try {
    const dashboard = await getCustomerDashboardData(customerId);
    if (!dashboard) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    return apiOk({ dashboard });
  } catch (error) {
    console.error('[Customer Dashboard] me failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_DASHBOARD_FAILED', '讀取客戶後台資料失敗', 500);
  }
}
