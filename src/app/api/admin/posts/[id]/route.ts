import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { getAdminGbpPost, updateGbpPost } from '@/lib/gbp-posts';

const postPatchSchema = z.object({
  scheduled_for: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().trim().min(1).max(1500).optional(),
  image_hint: z.string().trim().max(240).nullable().optional(),
  image_url: z.string().trim().url().nullable().optional(),
  cta_type: z.string().trim().max(40).nullable().optional(),
  cta_url: z.string().trim().url().nullable().optional(),
  error_message: z.string().trim().max(500).nullable().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const post = await getAdminGbpPost(id);
    if (!post) return apiError('POST_NOT_FOUND', '找不到 GBP 貼文', 404);
    return apiOk({ post });
  } catch (error) {
    console.error('[Admin Posts] detail failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('POST_DETAIL_FAILED', '讀取 GBP 貼文失敗', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const parsed = postPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '貼文資料格式錯誤', 400);
    }

    const post = await updateGbpPost(id, parsed.data);
    if (!post) return apiError('POST_NOT_FOUND', '找不到 GBP 貼文', 404);

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'gbp_post.update',
      targetType: 'gbp_post',
      targetId: post.id,
      payload: {
        customer_id: post.customer_id,
        updated_fields: Object.keys(parsed.data),
        status: post.status,
      },
    });

    return apiOk({ post });
  } catch (error) {
    console.error('[Admin Posts] update failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('POST_UPDATE_FAILED', '更新 GBP 貼文失敗', 500);
  }
}
