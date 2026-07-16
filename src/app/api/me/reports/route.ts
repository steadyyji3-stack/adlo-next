import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerReports } from '@/lib/customer-dashboard';

export async function GET() {
  const customerId = await getCustomerIdFromRequest();
  if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

  try {
    const reports = await listCustomerReports(customerId);
    return apiOk({ reports });
  } catch (error) {
    console.error('[Customer Dashboard] reports failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_REPORTS_FAILED', '讀取月報資料失敗', 500);
  }
}
