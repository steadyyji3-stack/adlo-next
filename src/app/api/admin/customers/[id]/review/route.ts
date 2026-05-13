import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { reviewCustomerOnboarding } from '@/lib/customers';
import { writeAuditLog } from '@/lib/audit-log';

const reviewSchema = z.object({
  decision: z.enum(['approved', 'needs_revision', 'rejected']),
  note: z.string().trim().max(500).optional(),
});

const actionByDecision = {
  approved: 'onboarding.approve',
  needs_revision: 'onboarding.request_revision',
  rejected: 'onboarding.reject',
} as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? 'review 決策格式錯誤', 400);
    }

    const customer = await reviewCustomerOnboarding(id, 'lorenzo', parsed.data.decision);
    if (!customer) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);

    await writeAuditLog({
      actor: 'lorenzo',
      action: actionByDecision[parsed.data.decision],
      targetType: 'customer',
      targetId: id,
      payload: {
        onboarding_status: parsed.data.decision,
        service_status: customer.service_status,
        has_review_note: Boolean(parsed.data.note),
      },
    });

    return apiOk({ customer });
  } catch (error) {
    console.error('[Admin Customers] review failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_REVIEW_FAILED', '更新 onboarding review 失敗', 500);
  }
}
