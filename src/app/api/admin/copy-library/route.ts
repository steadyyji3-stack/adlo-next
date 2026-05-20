import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import {
  createCopyAsset,
  listAdminCopyAssets,
  type CopyAssetChannel,
  type CopyAssetStatus,
} from '@/lib/copy-assets';

const channelSchema = z.enum(['gbp_post', 'review_reply', 'monthly_report', 'ads_copy']);
const statusSchema = z.enum(['draft', 'approved', 'archived']);

const copyAssetCreateSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  channel: channelSchema,
  title: z.string().trim().min(1).max(140),
  body: z.string().trim().min(1).max(3000),
  tone: z.string().trim().max(80).nullable().optional(),
  category: z.string().trim().max(80).nullable().optional(),
  status: statusSchema.default('draft'),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const channelParam = request.nextUrl.searchParams.get('channel');
    const statusParam = request.nextUrl.searchParams.get('status');
    const channel = channelParam && channelParam !== 'all' ? channelSchema.safeParse(channelParam) : null;
    const status = statusParam && statusParam !== 'all' ? statusSchema.safeParse(statusParam) : null;
    const assets = await listAdminCopyAssets({
      customerId: request.nextUrl.searchParams.get('customer_id') ?? undefined,
      channel: channel?.success ? channel.data as CopyAssetChannel : undefined,
      status: status?.success ? status.data as CopyAssetStatus : undefined,
    });
    return apiOk({ assets });
  } catch (error) {
    console.error('[Admin Copy Library] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('COPY_ASSETS_LIST_FAILED', '讀取文案庫失敗', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const parsed = copyAssetCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '文案格式錯誤', 400);
    }

    const asset = await createCopyAsset({
      customerId: parsed.data.customer_id,
      channel: parsed.data.channel,
      title: parsed.data.title,
      body: parsed.data.body,
      tone: parsed.data.tone,
      category: parsed.data.category,
      status: parsed.data.status,
      source: 'manual',
      tags: parsed.data.tags,
    });

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'copy_asset.create',
      targetType: 'copy_asset',
      targetId: asset.id,
      payload: {
        customer_id: asset.customer_id,
        channel: asset.channel,
        status: asset.status,
        title: asset.title,
        source: asset.source,
      },
    });

    return apiOk({ asset }, 201);
  } catch (error) {
    console.error('[Admin Copy Library] create failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('COPY_ASSET_CREATE_FAILED', '新增文案失敗', 500);
  }
}
