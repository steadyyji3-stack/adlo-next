import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import {
  generateCustomerContentBundle,
  listCustomerContentBundles,
} from '@/lib/customer-content-bundles';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerStoreProfile } from '@/lib/customer-store-profile';
import { getCustomerDetail } from '@/lib/customers';

export async function GET() {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) {
      return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);
    }

    const customer = await getCustomerDetail(customerId);
    if (!customer) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }
    if (!hasPaidAccess(customer.subscriptions)) {
      return apiError('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能使用內容工作台', 402);
    }

    const bundles = await listCustomerContentBundles(customerId);
    return apiOk({ bundles });
  } catch (error) {
    console.error('[ContentBundles] list failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CONTENT_BUNDLES_READ_FAILED', '讀取每週素材失敗', 500);
  }
}

export async function POST() {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) {
      return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);
    }

    const [customer, profile] = await Promise.all([
      getCustomerDetail(customerId),
      getCustomerStoreProfile(customerId),
    ]);
    if (!customer) {
      return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    }
    if (!hasPaidAccess(customer.subscriptions)) {
      return apiError('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能產生每週素材', 402);
    }
    if (!profile) {
      return apiError('STORE_PROFILE_REQUIRED', '請先完成店家檔案', 409);
    }

    const bundle = await generateCustomerContentBundle(customerId, profile);

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'content_bundle.generate',
      targetType: 'customer',
      targetId: customerId,
      payload: {
        week_start: bundle.week_start,
        gbp_posts_count: bundle.gbp_posts.length,
        line_broadcasts_count: bundle.line_broadcasts.length,
      },
    });

    return apiOk({ bundle }, 201);
  } catch (error) {
    console.error('[ContentBundles] generate failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('CONTENT_BUNDLE_GENERATE_FAILED', '產生每週素材失敗', 500);
  }
}

function hasPaidAccess(subscriptions: Array<{ status: string }>) {
  return subscriptions.some(
    (subscription) => ['active', 'trialing', 'past_due'].includes(subscription.status),
  );
}
