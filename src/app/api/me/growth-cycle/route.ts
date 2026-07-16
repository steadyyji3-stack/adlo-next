import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit-log';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { generateWeeklyGrowthTask } from '@/lib/customer-growth-agent';
import {
  completeCustomerGrowthCycle,
  getCurrentCustomerGrowthCycle,
  listCustomerGrowthCycles,
  saveCustomerGrowthCycle,
} from '@/lib/customer-growth-cycles';
import { getCustomerStoreProfile } from '@/lib/customer-store-profile';
import { getCustomerDetail } from '@/lib/customers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const generateSchema = z.object({ instruction: z.string().trim().max(300).optional() }).strict();
const completeSchema = z.object({ cycleId: z.string().uuid(), note: z.string().trim().max(300).optional() }).strict();

export async function GET() {
  try {
    const access = await paidCustomerAccess();
    if ('response' in access) return access.response;
    const [current, cycles] = await Promise.all([
      getCurrentCustomerGrowthCycle(access.customerId),
      listCustomerGrowthCycles(access.customerId),
    ]);
    return apiOk({ current, history: cycles });
  } catch (error) {
    console.error('[GrowthCycle] read failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('GROWTH_CYCLE_READ_FAILED', '讀取本週任務失敗', 500);
  }
}

export async function POST(request: Request) {
  try {
    const access = await paidCustomerAccess();
    if ('response' in access) return access.response;
    const body = await readJson(request);
    if (body === null) return apiError('INVALID_JSON', '請求格式不正確', 400);
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_FAILED', '調整指示不可超過 300 字', 400);
    const [profile, current, history] = await Promise.all([
      getCustomerStoreProfile(access.customerId),
      getCurrentCustomerGrowthCycle(access.customerId),
      listCustomerGrowthCycles(access.customerId),
    ]);
    if (!profile) return apiError('STORE_PROFILE_REQUIRED', '請先完成店家檔案', 409);
    const generationCount = (current?.generation_count ?? 0) + 1;
    if (generationCount > 4) return apiError('WEEKLY_GENERATION_LIMIT', '本週已調整 3 次，下週會產生新任務', 429);

    const generated = await generateWeeklyGrowthTask({
      profile,
      history,
      instruction: parsed.data.instruction,
    });
    const cycle = await saveCustomerGrowthCycle({
      customerId: access.customerId,
      profile,
      task: generated.task,
      evidence: generated.evidence,
      source: generated.source,
      instruction: parsed.data.instruction,
      generationCount,
    });
    await writeAuditLog({
      actor: `customer:${access.customerId}`,
      action: current ? 'growth_cycle.regenerate' : 'growth_cycle.generate',
      targetType: 'growth_cycle',
      targetId: cycle.id,
      payload: { week_start: cycle.week_start, task_type: cycle.task.type, source: generated.source },
    });
    return apiOk({ cycle }, current ? 200 : 201);
  } catch (error) {
    console.error('[GrowthCycle] generate failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('GROWTH_CYCLE_GENERATE_FAILED', '產生本週任務失敗', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const access = await paidCustomerAccess();
    if ('response' in access) return access.response;
    const body = await readJson(request);
    if (body === null) return apiError('INVALID_JSON', '請求格式不正確', 400);
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) return apiError('VALIDATION_FAILED', '完成資料格式不正確', 400);
    const cycle = await completeCustomerGrowthCycle(
      access.customerId,
      parsed.data.cycleId,
      parsed.data.note,
    );
    if (!cycle) return apiError('GROWTH_CYCLE_NOT_FOUND', '找不到本週任務', 404);
    await writeAuditLog({
      actor: `customer:${access.customerId}`,
      action: 'growth_cycle.complete',
      targetType: 'growth_cycle',
      targetId: cycle.id,
      payload: { week_start: cycle.week_start, task_type: cycle.task.type },
    });
    return apiOk({ cycle });
  } catch (error) {
    console.error('[GrowthCycle] complete failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('GROWTH_CYCLE_COMPLETE_FAILED', '更新任務失敗', 500);
  }
}

async function paidCustomerAccess() {
  const customerId = await getCustomerIdFromSession();
  if (!customerId) return { response: apiError('UNAUTHORIZED', '請先登入客戶後台', 401) };
  const customer = await getCustomerDetail(customerId);
  if (!customer) return { response: apiError('CUSTOMER_NOT_FOUND', '找不到客戶資料', 404) };
  const paid = customer.subscriptions.some(({ status }) => status === 'active' || status === 'trialing');
  if (!paid) return { response: apiError('SUBSCRIPTION_REQUIRED', '需要有效訂閱才能使用本週任務', 402) };
  return { customerId, customer };
}

async function readJson(request: Request) {
  try {
    return await request.json() as unknown;
  } catch {
    return null;
  }
}
