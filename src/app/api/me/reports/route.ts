import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { listCustomerReports } from '@/lib/customer-dashboard';

export async function GET(request: NextRequest) {
  const customerId = getCustomerIdFromRequest(request);
  if (!customerId) return apiError('UNAUTHORIZED', '客戶連結無法驗證，請從 adlo email 連結進入', 401);

  try {
    const reports = await listCustomerReports(customerId);
    return apiOk({ reports });
  } catch (error) {
    console.error('[Customer Dashboard] reports failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_REPORTS_FAILED', '讀取月報資料失敗', 500);
  }
}
