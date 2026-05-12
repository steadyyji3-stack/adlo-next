import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { isAdminRequest } from '@/lib/admin-auth';
import { getCustomerDetail, updateCustomer } from '@/lib/customers';
import { writeAuditLog } from '@/lib/audit-log';

const customerPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  line_id: z.string().trim().max(80).nullable().optional(),
  store_name: z.string().trim().min(1).max(120).optional(),
  store_address: z.string().trim().max(240).nullable().optional(),
  store_city: z.string().trim().max(40).nullable().optional(),
  gbp_url: z.string().trim().url().nullable().optional(),
  website_url: z.string().trim().url().nullable().optional(),
  industry: z.string().trim().max(80).nullable().optional(),
  signature_items: z.array(z.string().trim().min(1).max(80)).max(5).nullable().optional(),
  service_status: z.enum(['pending_onboarding', 'pending_review', 'active', 'paused', 'cancelled', 'churned']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const customer = await getCustomerDetail(id);
    if (!customer) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    return apiOk({ customer });
  } catch (error) {
    console.error('[Admin Customers] detail failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_DETAIL_FAILED', '讀取客戶詳情失敗', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return apiError('UNAUTHORIZED', '請先登入後台', 401);
  }

  try {
    const { id } = await params;
    const parsed = customerPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '客戶資料格式錯誤', 400);
    }

    const customer = await updateCustomer(id, parsed.data);
    if (!customer) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);

    await writeAuditLog({
      actor: 'lorenzo',
      action: 'customer.update',
      targetType: 'customer',
      targetId: id,
      payload: { updated_fields: Object.keys(parsed.data) },
    });

    return apiOk({ customer });
  } catch (error) {
    console.error('[Admin Customers] update failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CUSTOMER_UPDATE_FAILED', '更新客戶資料失敗', 500);
  }
}
