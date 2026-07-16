import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromRequest } from '@/lib/customer-auth';
import { createCustomerPortalSession } from '@/lib/customer-billing';

export async function POST() {
  try {
    const customerId = await getCustomerIdFromRequest();
    if (!customerId) {
      return apiError('CUSTOMER_ACCESS_REQUIRED', '請先登入客戶後台', 401);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adlo.tw';
    const returnUrl = `${origin}/customer/billing`;
    const result = await createCustomerPortalSession({ customerId, returnUrl });
    if (!result) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'billing.portal_session.create',
      targetType: 'customer',
      targetId: customerId,
      payload: {
        purpose: 'subscription_cancel',
        subscription_count: result.customer.subscriptions.length,
        service_status: result.customer.service_status,
      },
    });

    return apiOk({ url: result.session.url });
  } catch (error) {
    console.error('[Me Cancel] portal session failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('BILLING_PORTAL_CREATE_FAILED', '建立 Stripe 取消入口失敗', 500);
  }
}
