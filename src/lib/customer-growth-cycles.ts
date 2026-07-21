import 'server-only';
import type { StoreProfile } from '@/lib/store-profile';
import type {
  CustomerGrowthCycle,
  GrowthGenerationSource,
  GrowthTask,
} from '@/lib/customer-growth-types';
import { selectRows, updateRows, upsertRow } from '@/lib/supabase-rest';

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function currentTaipeiGrowthWeekStart(now = new Date()) {
  const taipei = new Date(now.getTime() + TAIPEI_OFFSET_MS);
  const daysSinceMonday = (taipei.getUTCDay() + 6) % 7;
  taipei.setUTCDate(taipei.getUTCDate() - daysSinceMonday);
  return taipei.toISOString().slice(0, 10);
}

export async function listCustomerGrowthCycles(customerId: string, limit = 12) {
  return selectRows<CustomerGrowthCycle>(
    'customer_growth_cycles',
    { customer_id: customerId },
    { order: 'week_start.desc', limit },
  );
}

export async function getCurrentCustomerGrowthCycle(customerId: string) {
  const [cycle] = await selectRows<CustomerGrowthCycle>(
    'customer_growth_cycles',
    { customer_id: customerId, week_start: currentTaipeiGrowthWeekStart() },
    { limit: 1 },
  );
  return cycle ?? null;
}

export async function saveCustomerGrowthCycle(input: {
  customerId: string;
  profile: StoreProfile;
  task: GrowthTask;
  evidence: string[];
  source: GrowthGenerationSource;
  instruction?: string;
  generationCount: number;
  previousCycle?: CustomerGrowthCycle | null;
}) {
  const revisions = input.previousCycle
    ? [
      ...(input.previousCycle.feedback?.revisions ?? []),
      {
        task: input.previousCycle.task,
        instruction: input.previousCycle.instruction,
        source: input.previousCycle.generation_source,
        savedAt: input.previousCycle.updated_at,
      },
    ].slice(-3)
    : [];
  return upsertRow<CustomerGrowthCycle>(
    'customer_growth_cycles',
    {
      customer_id: input.customerId,
      week_start: currentTaipeiGrowthWeekStart(),
      status: 'ready',
      task: input.task,
      evidence: input.evidence,
      profile_snapshot: input.profile,
      generation_source: input.source,
      generation_count: input.generationCount,
      instruction: input.instruction || null,
      feedback: revisions.length
        ? { ...input.previousCycle?.feedback, revisions }
        : null,
      completed_at: null,
    },
    'customer_id,week_start',
  );
}

export async function completeCustomerGrowthCycle(
  customerId: string,
  cycleId: string,
  note?: string,
) {
  const [existing] = await selectRows<CustomerGrowthCycle>(
    'customer_growth_cycles',
    { id: cycleId, customer_id: customerId },
    { limit: 1 },
  );
  if (!existing) return null;
  const [cycle] = await updateRows<CustomerGrowthCycle>(
    'customer_growth_cycles',
    { id: cycleId, customer_id: customerId },
    {
      status: 'completed',
      feedback: {
        ...(existing.feedback ?? {}),
        ...(note ? { note } : {}),
      },
      completed_at: new Date().toISOString(),
    },
  );
  return cycle ?? null;
}
