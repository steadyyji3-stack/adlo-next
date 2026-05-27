import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { approveCustomerOnboarding } from '@/lib/customers';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const customer = await approveCustomerOnboarding(id, 'lorenzo');
    if (!customer) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'onboarding.approve',
      targetType: 'customer',
      targetId: id,
      payload: { service_status: 'active', onboarding_status: 'approved' },
    });

    return apiOk({ customer });
  } catch (error) {
    console.error('[Admin Customers] approve failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_APPROVE_FAILED', '通過 onboarding 失敗', 500);
  }
}
