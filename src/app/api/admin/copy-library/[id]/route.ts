import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { updateCopyAsset } from '@/lib/copy-assets';

const copyAssetUpdateSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  channel: z.enum(['gbp_post', 'review_reply', 'monthly_report', 'ads_copy']).optional(),
  title: z.string().trim().min(1).max(140).optional(),
  body: z.string().trim().min(1).max(3000).optional(),
  tone: z.string().trim().max(80).nullable().optional(),
  category: z.string().trim().max(80).nullable().optional(),
  status: z.enum(['draft', 'approved', 'archived']).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const parsed = copyAssetUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '文案格式錯誤', 400);
    }

    const asset = await updateCopyAsset(id, parsed.data);
    if (!asset) {
      return apiError('COPY_ASSET_NOT_FOUND', '找不到文案', 404);
    }

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'copy_asset.update',
      targetType: 'copy_asset',
      targetId: asset.id,
      payload: {
        customer_id: asset.customer_id,
        channel: asset.channel,
        status: asset.status,
        title: asset.title,
        updated_fields: Object.keys(parsed.data),
      },
    });

    return apiOk({ asset });
  } catch (error) {
    console.error('[Admin Copy Library] update failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('COPY_ASSET_UPDATE_FAILED', '更新文案失敗', 500);
  }
}
