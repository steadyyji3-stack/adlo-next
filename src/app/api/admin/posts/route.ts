import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { createGbpPostDraft, listAdminGbpPosts } from '@/lib/gbp-posts';

const postCreateSchema = z.object({
  customer_id: z.string().uuid(),
  scheduled_for: z.string().datetime(),
  status: z.enum(['draft', 'scheduled']).default('draft'),
  category: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(1500),
  image_hint: z.string().trim().max(240).nullable().optional(),
  cta_type: z.string().trim().max(40).nullable().optional(),
  cta_url: z.string().trim().url().nullable().optional(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const customerId = request.nextUrl.searchParams.get('customer_id') ?? undefined;
    const status = request.nextUrl.searchParams.get('status') ?? undefined;
    const posts = await listAdminGbpPosts({ customerId, status });
    return apiOk({ posts });
  } catch (error) {
    console.error('[Admin Posts] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('POSTS_LIST_FAILED', '讀取 GBP 貼文清單失敗', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const parsed = postCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '貼文資料格式錯誤', 400);
    }

    const post = await createGbpPostDraft({
      customerId: parsed.data.customer_id,
      scheduledFor: parsed.data.scheduled_for,
      status: parsed.data.status,
      category: parsed.data.category,
      title: parsed.data.title,
      content: parsed.data.content,
      imageHint: parsed.data.image_hint,
      ctaType: parsed.data.cta_type,
      ctaUrl: parsed.data.cta_url,
    });

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'gbp_post.create',
      targetType: 'gbp_post',
      targetId: post.id,
      payload: {
        customer_id: post.customer_id,
        status: post.status,
        category: post.category,
        scheduled_for: post.scheduled_for,
      },
    });

    return apiOk({ post }, 201);
  } catch (error) {
    console.error('[Admin Posts] create failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('POST_CREATE_FAILED', '建立 GBP 貼文草稿失敗', 500);
  }
}
