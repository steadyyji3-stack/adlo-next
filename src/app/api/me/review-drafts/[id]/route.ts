import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import {
  deleteCustomerReviewDraft,
  reviewDraftUpdateSchema,
  updateCustomerReviewDraft,
} from '@/lib/customer-review-workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ReviewDraftRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: ReviewDraftRouteContext) {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

    const parsed = reviewDraftUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '輸入資料不完整', 400);
    }

    const { id } = await context.params;
    const draft = await updateCustomerReviewDraft({
      customerId,
      draftId: id,
      selectedReply: parsed.data.selectedReply,
      status: parsed.data.status,
    });
    if (!draft) return apiError('REVIEW_DRAFT_NOT_FOUND', '找不到評論草稿', 404);

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'customer.review_draft.update',
      targetType: 'customer_review_draft',
      targetId: draft.id,
      payload: {
        selectedReplyLength: parsed.data.selectedReply.length,
        status: parsed.data.status,
      },
    });

    return apiOk({ draft });
  } catch (error) {
    console.error('[ReviewWorkspace] update failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEW_DRAFT_UPDATE_FAILED', '儲存評論草稿失敗', 500);
  }
}

export async function DELETE(_request: Request, context: ReviewDraftRouteContext) {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

    const { id } = await context.params;
    const draft = await deleteCustomerReviewDraft(customerId, id);
    if (!draft) return apiError('REVIEW_DRAFT_NOT_FOUND', '找不到評論草稿', 404);

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'customer.review_draft.delete',
      targetType: 'customer_review_draft',
      targetId: draft.id,
      payload: { rating: draft.rating },
    });

    return apiOk({ deletedId: draft.id });
  } catch (error) {
    console.error('[ReviewWorkspace] delete failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEW_DRAFT_DELETE_FAILED', '刪除評論草稿失敗', 500);
  }
}
