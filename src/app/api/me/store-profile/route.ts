import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import {
  customerStoreProfileInputSchema,
  getCustomerStoreProfile,
  saveCustomerStoreProfile,
} from '@/lib/customer-store-profile';
import { getCustomerDetail, updateCustomer } from '@/lib/customers';

export async function GET() {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) {
      return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);
    }

    const profile = await getCustomerStoreProfile(customerId);
    return apiOk({ profile });
  } catch (error) {
    console.error('[StoreProfile] read failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('STORE_PROFILE_READ_FAILED', '讀取店家檔案失敗', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) {
      return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);
    }

    const parsed = customerStoreProfileInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(
        'VALIDATION_FAILED',
        parsed.error.issues[0]?.message ?? '店家檔案資料不完整',
        400,
      );
    }

    const customer = await getCustomerDetail(customerId);
    if (!customer) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }

    const profile = await saveCustomerStoreProfile(customerId, parsed.data);
    await updateCustomer(customerId, {
      store_name: profile.storeName,
      industry: profile.industry,
    });

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'customer.store_profile.update',
      targetType: 'customer',
      targetId: customerId,
      payload: {
        fields: ['storeName', 'industry', 'selectedTags', 'weekTheme', 'businessType', 'channels'],
      },
    });

    return apiOk({ profile });
  } catch (error) {
    console.error('[StoreProfile] update failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('STORE_PROFILE_UPDATE_FAILED', '更新店家檔案失敗', 500);
  }
}
