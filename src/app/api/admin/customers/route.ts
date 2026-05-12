import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { listCustomers } from '@/lib/customers';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const status = request.nextUrl.searchParams.get('status') ?? undefined;
    const plan = request.nextUrl.searchParams.get('plan') ?? undefined;
    const customers = await listCustomers({ status, plan });
    return apiOk({ customers });
  } catch (error) {
    console.error('[Admin Customers] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMERS_LIST_FAILED', '讀取客戶清單失敗', 500);
  }
}
