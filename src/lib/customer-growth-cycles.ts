import 'server-only';
import type { StoreProfile } from '@/lib/store-profile';
import type {
  CustomerGrowthCycle,
  GrowthGenerationSource,
  GrowthTask,
} from '@/lib/customer-growth-types';
import { currentTaipeiWeekStart } from '@/lib/customer-content-bundles';
import { selectRows, updateRows, upsertRow } from '@/lib/supabase-rest';

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
    { customer_id: customerId, week_start: currentTaipeiWeekStart() },
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
}) {
  return upsertRow<CustomerGrowthCycle>(
    'customer_growth_cycles',
    {
      customer_id: input.customerId,
      week_start: currentTaipeiWeekStart(),
      status: 'ready',
      task: input.task,
      evidence: input.evidence,
      profile_snapshot: input.profile,
      generation_source: input.source,
      generation_count: input.generationCount,
      instruction: input.instruction || null,
      feedback: null,
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
  const [cycle] = await updateRows<CustomerGrowthCycle>(
    'customer_growth_cycles',
    { id: cycleId, customer_id: customerId },
    {
      status: 'completed',
      feedback: note ? { note } : {},
      completed_at: new Date().toISOString(),
    },
  );
  return cycle ?? null;
}
