import 'server-only';

import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';
import type { Customer, Subscription, SubscriptionStatus } from '@/lib/customers';
import { selectRows } from '@/lib/supabase-rest';

type FunnelStepId = 'subscribed' | 'profiled' | 'activated' | 'completed' | 'feedback' | 'week_two';
type ActiveSubscriptionStatus = Extract<SubscriptionStatus, 'active' | 'trialing'>;
type ActiveSubscription = Subscription & { status: ActiveSubscriptionStatus };

interface CustomerStoreProfileRow {
  customer_id: string;
}

export interface CoreFunnelStep {
  id: FunnelStepId;
  label: string;
  description: string;
  count: number;
  rate: number | null;
  rateLabel: string;
}

export interface CoreSubscriptionCustomer {
  id: string;
  storeName: string;
  name: string;
  subscriptionStatus: ActiveSubscriptionStatus;
  stage: FunnelStepId;
  stageLabel: string;
  generatedWeeks: number;
  completedWeeks: number;
  hasFeedback: boolean;
  lastActivityAt: string;
}

export interface CoreSubscriptionMetrics {
  generatedAt: string;
  paidCustomers: number;
  funnel: CoreFunnelStep[];
  customers: CoreSubscriptionCustomer[];
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>(['active', 'trialing']);

const STAGE_LABELS: Record<FunnelStepId, string> = {
  subscribed: '已訂閱',
  profiled: '完成店家檔案',
  activated: '取得第一任務',
  completed: '完成任務',
  feedback: '留下回饋',
  week_two: '第二週回來',
};

export async function getCoreSubscriptionMetrics(): Promise<CoreSubscriptionMetrics> {
  const [customers, subscriptions, profiles, growthCycles] = await Promise.all([
    selectRows<Customer>('customers', undefined, { order: 'created_at.desc' }),
    selectRows<Subscription>('subscriptions', undefined, { order: 'updated_at.desc' }),
    selectRows<CustomerStoreProfileRow>('customer_store_profiles', undefined, { select: 'customer_id' }),
    selectRows<CustomerGrowthCycle>('customer_growth_cycles', undefined, { order: 'week_start.desc' }),
  ]);

  const activeSubscriptions = subscriptions.filter(isActiveSubscription);
  const activeSubscriptionByCustomer = new Map<string, ActiveSubscription>();
  for (const subscription of activeSubscriptions) {
    if (!activeSubscriptionByCustomer.has(subscription.customer_id)) {
      activeSubscriptionByCustomer.set(subscription.customer_id, subscription);
    }
  }

  const profileCustomerIds = new Set(profiles.map((profile) => profile.customer_id));
  const cyclesByCustomer = groupCyclesByCustomer(growthCycles);
  const paidCustomers = customers.filter((customer) => activeSubscriptionByCustomer.has(customer.id));

  const customerMetrics = paidCustomers.map((customer) => {
    const cycles = cyclesByCustomer.get(customer.id) ?? [];
    const completedCycles = cycles.filter((cycle) => cycle.status === 'completed');
    const hasFeedback = completedCycles.some(hasWrittenFeedback);
    const distinctWeeks = new Set(cycles.map((cycle) => cycle.week_start)).size;
    const hasProfile = profileCustomerIds.has(customer.id);
    const stage = getCustomerStage({
      hasProfile,
      generatedWeeks: distinctWeeks,
      completedWeeks: completedCycles.length,
      hasFeedback,
    });
    const subscription = activeSubscriptionByCustomer.get(customer.id)!;

    return {
      id: customer.id,
      storeName: customer.store_name,
      name: customer.name,
      subscriptionStatus: subscription.status,
      stage,
      stageLabel: STAGE_LABELS[stage],
      generatedWeeks: distinctWeeks,
      completedWeeks: completedCycles.length,
      hasFeedback,
      lastActivityAt: latestDate([
        customer.updated_at,
        subscription.updated_at,
        ...cycles.map((cycle) => cycle.updated_at),
      ]),
    } satisfies CoreSubscriptionCustomer;
  }).sort((a, b) => Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt));

  const paidCount = customerMetrics.length;
  const profiledCount = customerMetrics.filter((customer) => profileCustomerIds.has(customer.id)).length;
  const activatedCount = customerMetrics.filter((customer) => customer.generatedWeeks >= 1).length;
  const completedCount = customerMetrics.filter((customer) => customer.completedWeeks >= 1).length;
  const feedbackCount = customerMetrics.filter((customer) => customer.hasFeedback).length;
  const weekTwoCount = customerMetrics.filter((customer) => customer.generatedWeeks >= 2).length;

  return {
    generatedAt: new Date().toISOString(),
    paidCustomers: paidCount,
    funnel: [
      createStep('subscribed', '付費或試用中的有效訂閱', paidCount, null, '目前母體'),
      createStep('profiled', '完成自助 onboarding 的店家資料', profiledCount, paidCount, '占有效訂閱'),
      createStep('activated', '至少產生一週的成長任務', activatedCount, paidCount, '占有效訂閱'),
      createStep('completed', '至少完成一週任務', completedCount, activatedCount, '占已取得任務'),
      createStep('feedback', '完成後留下有效文字回饋', feedbackCount, completedCount, '占已完成任務'),
      createStep('week_two', '至少在兩個不同週次取得任務', weekTwoCount, activatedCount, '占已啟用客戶'),
    ],
    customers: customerMetrics,
  };
}

function groupCyclesByCustomer(cycles: CustomerGrowthCycle[]) {
  const grouped = new Map<string, CustomerGrowthCycle[]>();
  for (const cycle of cycles) {
    const customerCycles = grouped.get(cycle.customer_id) ?? [];
    customerCycles.push(cycle);
    grouped.set(cycle.customer_id, customerCycles);
  }
  return grouped;
}

function hasWrittenFeedback(cycle: CustomerGrowthCycle) {
  return typeof cycle.feedback?.note === 'string' && cycle.feedback.note.trim().length > 0;
}

function isActiveSubscription(subscription: Subscription): subscription is ActiveSubscription {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status);
}

function getCustomerStage(input: {
  hasProfile: boolean;
  generatedWeeks: number;
  completedWeeks: number;
  hasFeedback: boolean;
}): FunnelStepId {
  if (input.generatedWeeks >= 2) return 'week_two';
  if (input.hasFeedback) return 'feedback';
  if (input.completedWeeks >= 1) return 'completed';
  if (input.generatedWeeks >= 1) return 'activated';
  if (input.hasProfile) return 'profiled';
  return 'subscribed';
}

function createStep(
  id: FunnelStepId,
  description: string,
  count: number,
  denominator: number | null,
  rateLabel: string,
): CoreFunnelStep {
  return {
    id,
    label: STAGE_LABELS[id],
    description,
    count,
    rate: denominator === null ? null : percentage(count, denominator),
    rateLabel,
  };
}

function percentage(value: number, denominator: number) {
  if (denominator === 0) return 0;
  return Math.round((value / denominator) * 100);
}

function latestDate(values: string[]) {
  return values.reduce((latest, value) => Date.parse(value) > Date.parse(latest) ? value : latest);
}
