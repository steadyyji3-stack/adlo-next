import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerStoreProfile } from '@/lib/customer-store-profile';
import { getCustomerDetail } from '@/lib/customers';
import {
  isRelatedHostname,
  optimizeCustomerSite,
  SiteOptimizerError,
} from '@/lib/customer-site-optimizer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const requestSchema = z.object({
  url: z.string().trim().url('請輸入完整網站網址').max(500, '網址過長'),
}).strict();

const paidStatuses = new Set(['active', 'trialing', 'past_due']);

export async function POST(request: Request) {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '網址格式錯誤', 400);
    }

    const [customer, profile] = await Promise.all([
      getCustomerDetail(customerId),
      getCustomerStoreProfile(customerId),
    ]);
    if (!customer) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    if (!customer.subscriptions.some((subscription) => paidStatuses.has(subscription.status))) {
      return apiError('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能使用一鍵全站優化', 402);
    }
    if (!profile) return apiError('STORE_PROFILE_REQUIRED', '請先完成店家檔案', 409);
    if (!customer.website_url) return apiError('WEBSITE_REQUIRED', '請先在 onboarding 填寫店家網站', 409);

    const requestedUrl = new URL(parsed.data.url);
    const registeredUrl = new URL(customer.website_url);
    if (!isRelatedHostname(requestedUrl.hostname, registeredUrl.hostname)) {
      return apiError('WEBSITE_HOST_MISMATCH', '只能掃描 onboarding 已登記的店家網站', 403);
    }

    const report = await optimizeCustomerSite({
      targetUrl: parsed.data.url,
      customer,
      profile,
    });

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'customer.site_optimizer.scan',
      targetType: 'customer',
      targetId: customerId,
      payload: {
        hostname: report.hostname,
        pageCount: report.pages.length,
        coverage: report.coverage,
        industryMode: report.industryMode,
      },
    });

    return apiOk({ report });
  } catch (error) {
    if (error instanceof SiteOptimizerError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error('[SiteOptimizer] scan failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('SITE_OPTIMIZER_FAILED', '產生全站優化包失敗，請稍後再試', 500);
  }
}
