import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { createOnboardingSubmission, getCustomerDetail } from '@/lib/customers';
import { writeAuditLog } from '@/lib/audit-log';

const onboardingSchema = z.object({
  customerId: z.string().uuid(),
  storeName: z.string().trim().min(1, '店家名稱必填').max(120),
  storeAddress: z.string().trim().max(240).optional(),
  storeCity: z.string().trim().max(40).optional(),
  gbpUrl: z.string().trim().url('請輸入有效的 Google 商家網址'),
  websiteUrl: z.string().trim().url('請輸入有效網址').optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional(),
  lineId: z.string().trim().max(80).optional(),
  industry: z.string().trim().max(80).optional(),
  signatureItems: z.array(z.string().trim().min(1).max(80)).min(1).max(5),
  ga4PropertyId: z.string().trim().max(80).optional(),
  metaPageId: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = onboardingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '表單資料不完整', 400);
    }

    const existingCustomer = await getCustomerDetail(parsed.data.customerId);
    if (!existingCustomer) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }

    const result = await createOnboardingSubmission(parsed.data);

    await writeAuditLog({
      actor: `customer:${parsed.data.customerId}`,
      action: 'onboarding.submit',
      targetType: 'customer',
      targetId: parsed.data.customerId,
      payload: {
        fields: ['store_profile', 'gbp_url', 'contact', 'signature_items'],
        has_website_url: Boolean(parsed.data.websiteUrl),
        has_ga4_property_id: Boolean(parsed.data.ga4PropertyId),
        has_meta_page_id: Boolean(parsed.data.metaPageId),
      },
    });

    return apiOk({ customer: result.customer, submission: result.submission }, 201);
  } catch (error) {
    console.error('[Onboarding] submit failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('ONBOARDING_SUBMIT_FAILED', '送出 onboarding 表單失敗', 500);
  }
}
