import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import {
  checkReviewDraftQuota,
  createCustomerReviewDraft,
  generateReviewDraft,
  incrementReviewDraftQuota,
  listCustomerReviewDrafts,
  reviewDraftInputSchema,
  ReviewWorkspaceError,
} from '@/lib/customer-review-workspace';
import { getCustomerDetail } from '@/lib/customers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

const paidStatuses = new Set(['active', 'trialing', 'past_due']);

export async function GET() {
  try {
    const access = await getPaidCustomerAccess();
    if ('response' in access) return access.response;

    const drafts = await listCustomerReviewDrafts(access.customerId);
    let quota = { allowed: true, count: 0, limit: 20, resetAt: Date.now() + 86_400_000 };
    try {
      quota = await checkReviewDraftQuota(access.customerId);
    } catch (error) {
      console.error('[ReviewWorkspace] quota unavailable', error instanceof Error ? error.message : 'unknown error');
    }
    return apiOk({
      drafts,
      quota: { count: quota.count, limit: quota.limit, resetAt: quota.resetAt },
    });
  } catch (error) {
    console.error('[ReviewWorkspace] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEW_DRAFTS_READ_FAILED', '讀取評論草稿失敗', 500);
  }
}

export async function POST(request: Request) {
  try {
    const access = await getPaidCustomerAccess();
    if ('response' in access) return access.response;

    const parsed = reviewDraftInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '輸入資料不完整', 400);
    }

    // Fail before incurring model cost when the migration has not been applied.
    await listCustomerReviewDrafts(access.customerId, 1);

    let quota = { allowed: true, count: 0, limit: 20, resetAt: Date.now() + 86_400_000 };
    try {
      quota = await checkReviewDraftQuota(access.customerId);
    } catch (error) {
      console.error('[ReviewWorkspace] quota unavailable', error instanceof Error ? error.message : 'unknown error');
    }
    if (!quota.allowed) {
      return apiError('RATE_LIMIT', '今日 20 則評論草稿額度已用完，請於額度重置後再試', 429);
    }

    const generated = await generateReviewDraft(parsed.data);
    const draft = await createCustomerReviewDraft({
      customerId: access.customerId,
      source: parsed.data,
      variants: generated.variants,
      tips: generated.tips,
    });

    try {
      await incrementReviewDraftQuota(access.customerId);
    } catch (error) {
      console.error('[ReviewWorkspace] quota increment failed', error instanceof Error ? error.message : 'unknown error');
    }

    await writeAuditLog({
      actor: `customer:${access.customerId}`,
      action: 'customer.review_draft.generate',
      targetType: 'customer_review_draft',
      targetId: draft.id,
      payload: {
        rating: parsed.data.rating,
        reviewTextLength: parsed.data.reviewText.length,
        ownerNoteLength: parsed.data.ownerNote.length,
        variantCount: generated.variants.length,
        tokensUsed: generated.tokensUsed,
      },
    });

    return apiOk({
      draft,
      quota: { count: quota.count + 1, limit: quota.limit, resetAt: quota.resetAt },
    }, 201);
  } catch (error) {
    if (error instanceof ReviewWorkspaceError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error('[ReviewWorkspace] generation failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEW_DRAFT_GENERATE_FAILED', '產生評論草稿失敗，請稍後再試', 500);
  }
}

async function getPaidCustomerAccess() {
  const customerId = await getCustomerIdFromSession();
  if (!customerId) return { response: apiError('UNAUTHORIZED', '請先登入客戶後台', 401) };

  const customer = await getCustomerDetail(customerId);
  if (!customer) return { response: apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404) };
  if (!customer.subscriptions.some((subscription) => paidStatuses.has(subscription.status))) {
    return { response: apiError('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能使用評論工作區', 402) };
  }

  return { customerId };
}
