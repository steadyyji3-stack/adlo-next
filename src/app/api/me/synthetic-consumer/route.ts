import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerDetail } from '@/lib/customers';
import {
  generateSyntheticConsumerReport,
  syntheticConsumerInputSchema,
  SyntheticConsumerError,
} from '@/lib/customer-synthetic-consumer';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOOL = 'synthetic-consumer';
const paidStatuses = new Set(['active', 'trialing', 'past_due']);

export async function POST(request: Request) {
  try {
    const customerId = await getCustomerIdFromSession();
    if (!customerId) return apiError('UNAUTHORIZED', '請先登入客戶後台', 401);

    const parsed = syntheticConsumerInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', parsed.error.issues[0]?.message ?? '輸入資料不完整', 400);
    }

    const customer = await getCustomerDetail(customerId);
    if (!customer) return apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404);
    if (!customer.subscriptions.some((subscription) => paidStatuses.has(subscription.status))) {
      return apiError('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能使用合成消費者分析', 402);
    }

    let quota = { allowed: true, count: 0, limit: 3, resetAt: Date.now() + 86_400_000 };
    try {
      quota = await checkRateLimit(customerId, TOOL);
    } catch (error) {
      console.error('[SyntheticConsumer] rate limit unavailable', error instanceof Error ? error.message : 'unknown error');
    }
    if (!quota.allowed) {
      return apiError('RATE_LIMIT', '今日 3 份分析額度已用完，請於額度重置後再試', 429);
    }

    const { report, tokensUsed } = await generateSyntheticConsumerReport(parsed.data);

    try {
      await incrementRateLimit(customerId, TOOL);
    } catch (error) {
      console.error('[SyntheticConsumer] quota increment failed', error instanceof Error ? error.message : 'unknown error');
    }

    await writeAuditLog({
      actor: `customer:${customerId}`,
      action: 'customer.synthetic_consumer.generate',
      targetType: 'customer',
      targetId: customerId,
      payload: {
        productConceptLength: parsed.data.productConcept.length,
        targetAudienceLength: parsed.data.targetAudience.length,
        hasTestFocus: Boolean(parsed.data.testFocus),
        consumerCount: report.consumers.length,
        tokensUsed,
      },
    });

    return apiOk({
      report,
      quota: { count: quota.count + 1, limit: quota.limit, resetAt: quota.resetAt },
    });
  } catch (error) {
    if (error instanceof SyntheticConsumerError) {
      return apiError(error.code, error.message, error.status);
    }
    console.error('[SyntheticConsumer] generation failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('SYNTHETIC_CONSUMER_FAILED', '分析產生失敗，請稍後再試', 500);
  }
}
