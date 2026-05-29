import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { getAdminGbpReview, updateGbpReviewReply } from '@/lib/gbp-reviews';

const reviewPatchSchema = z.object({
  reply_text: z.string().trim().min(1).max(1500).nullable().optional(),
  reply_status: z.enum(['pending', 'drafted', 'posted']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const review = await getAdminGbpReview(id);
    if (!review) return apiError('REVIEW_NOT_FOUND', '找不到 GBP 評論', 404);
    return apiOk({ review });
  } catch (error) {
    console.error('[Admin Reviews] detail failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEW_DETAIL_FAILED', '讀取 GBP 評論失敗', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const parsed = reviewPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '評論回覆資料格式錯誤', 400);
    }

    const updatePayload = {
      ...parsed.data,
      reply_posted_at: parsed.data.reply_status === 'posted' ? new Date().toISOString() : undefined,
    };
    const review = await updateGbpReviewReply(id, updatePayload);
    if (!review) return apiError('REVIEW_NOT_FOUND', '找不到 GBP 評論', 404);

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'gbp_review.reply_update',
      targetType: 'gbp_review',
      targetId: review.id,
      payload: {
        customer_id: review.customer_id,
        updated_fields: Object.keys(parsed.data),
        reply_status: review.reply_status,
        has_reply_text: Boolean(review.reply_text),
      },
    });

    return apiOk({ review });
  } catch (error) {
    console.error('[Admin Reviews] update failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('REVIEW_UPDATE_FAILED', '更新 GBP 評論回覆失敗', 500);
  }
}
