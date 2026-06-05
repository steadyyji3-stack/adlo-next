import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromRequest, getCustomerIdFromTokenOrDevFallback, isUnsignedCustomerIdAllowed } from '@/lib/customer-auth';
import { buildCustomerPathWithToken, createCustomerLinkToken } from '@/lib/customer-link-token';
import { createCustomerPortalSession } from '@/lib/customer-billing';

const cancelRequestSchema = z.object({
  customer_id: z.string().uuid().optional(),
  customer_token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = cancelRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '取消訂閱資料格式錯誤', 400);
    }

    const customerId = getCustomerIdFromTokenOrDevFallback(parsed.data) ?? getCustomerIdFromRequest(request);
    if (!customerId) {
      return apiError('CUSTOMER_ACCESS_REQUIRED', '客戶連結無法驗證', 401);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adlo.tw';
    const returnUrl = buildBillingReturnUrl(origin, customerId);
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

function buildBillingReturnUrl(origin: string, customerId: string) {
  try {
    const { token } = createCustomerLinkToken({ customerId, expiresInDays: 30 });
    return new URL(buildCustomerPathWithToken('billing', token), origin).toString();
  } catch {
    if (!isUnsignedCustomerIdAllowed()) {
      throw new Error('CUSTOMER_LINK_SECRET is required for customer billing return URL');
    }
    return new URL(`/customer/billing?customer_id=${encodeURIComponent(customerId)}`, origin).toString();
  }
}
