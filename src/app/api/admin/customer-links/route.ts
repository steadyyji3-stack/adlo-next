import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { buildCustomerPathWithToken, createCustomerLinkToken } from '@/lib/customer-link-token';
import { getCustomerDetail } from '@/lib/customers';

const customerLinkSchema = z.object({
  customer_id: z.string().uuid(),
  destination: z.enum(['dashboard', 'billing', 'onboarding']).default('dashboard'),
  expires_in_days: z.number().int().min(1).max(90).default(30),
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const parsed = customerLinkSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '客戶連結格式錯誤', 400);
    }

    const customer = await getCustomerDetail(parsed.data.customer_id);
    if (!customer) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }

    const { token, expiresAt } = createCustomerLinkToken({
      customerId: customer.id,
      expiresInDays: parsed.data.expires_in_days,
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.nextUrl.origin;
    const url = new URL(buildCustomerPathWithToken(parsed.data.destination, token), origin);

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'customer_link.create',
      targetType: 'customer',
      targetId: customer.id,
      payload: {
        destination: parsed.data.destination,
        expires_at: expiresAt.toISOString(),
        expires_in_days: parsed.data.expires_in_days,
      },
    });

    return apiOk({
      url: url.toString(),
      expires_at: expiresAt.toISOString(),
      customer: {
        id: customer.id,
        email: customer.email,
        store_name: customer.store_name,
      },
    }, 201);
  } catch (error) {
    console.error('[Admin Customer Links] create failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_LINK_CREATE_FAILED', '產生客戶連結失敗，請確認 CUSTOMER_LINK_SECRET 已設定', 500);
  }
}
