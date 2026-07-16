import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { customerStoreProfileInputSchema } from '@/lib/customer-store-profile';
import { completeSelfServeOnboarding, getCustomerDetail } from '@/lib/customers';
import { writeAuditLog } from '@/lib/audit-log';

const onboardingSchema = z.object({
  storeProfile: customerStoreProfileInputSchema,
  storeAddress: z.string().trim().max(240).optional(),
  storeCity: z.string().trim().max(40).optional(),
  gbpUrl: z.string().trim().url('請輸入有效的 Google 商家網址').optional().or(z.literal('')),
  websiteUrl: z.string().trim().url('請輸入有效網址').optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional(),
  lineId: z.string().trim().max(80).optional(),
  signatureItems: z.array(z.string().trim().min(1).max(80)).min(1).max(5),
  notes: z.string().trim().max(1200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = onboardingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '表單資料不完整', 400);
    }

    const customerId = await getCustomerIdFromSession();
    if (!customerId) {
      return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);
    }

    const existingCustomer = await getCustomerDetail(customerId);
    if (!existingCustomer) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }

    const result = await completeSelfServeOnboarding({
      ...parsed.data,
      customerId,
    });

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'onboarding.complete',
      targetType: 'customer',
      targetId: customerId,
      payload: {
        fields: ['store_profile', 'business_contact', 'gbp_url', 'website_url', 'signature_items'],
        onboarding_status: 'approved',
        completion_mode: 'self_service',
        has_website_url: Boolean(parsed.data.websiteUrl),
        has_gbp_url: Boolean(parsed.data.gbpUrl),
      },
    });

    return apiOk(
      {
        customer: result.customer,
        submission: result.submission,
        profile: result.profile,
      },
      201,
    );
  } catch (error) {
    console.error('[Onboarding] submit failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('ONBOARDING_SUBMIT_FAILED', '送出 onboarding 表單失敗', 500);
  }
}
