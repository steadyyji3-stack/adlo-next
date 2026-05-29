import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { getCustomerDashboardData } from '@/lib/customer-dashboard';

export async function GET(request: NextRequest) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) return apiError('UNAUTHORIZED', '缺少 customer_id，請從 onboarding email 連結進入', 401);

  try {
    const dashboard = await getCustomerDashboardData(customerId);
    if (!dashboard) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    return apiOk({ dashboard });
  } catch (error) {
    console.error('[Customer Dashboard] me failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_DASHBOARD_FAILED', '讀取客戶後台資料失敗', 500);
  }
}
