import 'server-only';
import { insertRow, selectRows, updateRows, upsertRow } from '@/lib/supabase-rest';

export type OnboardingStatus = 'not_started' | 'pending_review' | 'approved' | 'needs_revision' | 'rejected';
export type ServiceStatus = 'pending_onboarding' | 'pending_review' | 'active' | 'paused' | 'cancelled' | 'churned';
export type SubscriptionStatus = 'active' | 'trialing' | 'paused' | 'cancelled' | 'past_due' | 'incomplete' | 'unpaid';
export type PlanId = 'gbp-auto' | 'local-seo' | 'ads-managed' | 'starter' | 'growth' | 'dominate';

export interface Customer {
  id: string;
  stripe_customer_id: string;
  email: string;
  name: string;
  phone: string | null;
  line_id: string | null;
  store_name: string;
  store_address: string | null;
  store_city: string | null;
  gbp_url: string | null;
  website_url: string | null;
  industry: string | null;
  signature_items: string[] | null;
  onboarding_status: OnboardingStatus;
  service_status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string;
  plan_id: PlanId;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingSubmission {
  id: string;
  customer_id: string;
  status: 'pending_review' | 'approved' | 'needs_revision' | 'rejected';
  gbp_permission_blob: string | null;
  ga4_property_id: string | null;
  meta_page_id: string | null;
  meta_admin_status: 'invited' | 'accepted' | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface CustomerDetail extends Customer {
  subscriptions: Subscription[];
  onboarding_submissions: OnboardingSubmission[];
}

export type OnboardingReviewDecision = 'approved' | 'needs_revision' | 'rejected';

export async function upsertCheckoutCustomer(input: {
  stripeCustomerId: string;
  email: string;
  name: string;
  storeName: string;
}) {
  return upsertRow<Customer>(
    'customers',
    {
      stripe_customer_id: input.stripeCustomerId,
      email: input.email,
      name: input.name,
      store_name: input.storeName,
      onboarding_status: 'not_started',
      service_status: 'pending_onboarding',
    },
    'stripe_customer_id',
  );
}

export async function upsertSubscription(input: {
  customerId: string;
  stripeSubscriptionId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string | null;
  cancelledAt?: string | null;
}) {
  return upsertRow<Subscription>(
    'subscriptions',
    {
      customer_id: input.customerId,
      stripe_subscription_id: input.stripeSubscriptionId,
      plan_id: input.planId,
      status: input.status,
      current_period_start: input.currentPeriodStart,
      current_period_end: input.currentPeriodEnd,
      trial_end: input.trialEnd ?? null,
      cancelled_at: input.cancelledAt ?? null,
    },
    'stripe_subscription_id',
  );
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const [subscription] = await selectRows<Subscription>(
    'subscriptions',
    { stripe_subscription_id: stripeSubscriptionId },
    { limit: 1 },
  );
  return subscription ?? null;
}

export async function syncExistingSubscription(input: {
  stripeSubscriptionId: string;
  planId?: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEnd?: string | null;
  cancelledAt?: string | null;
}) {
  const existing = await getSubscriptionByStripeId(input.stripeSubscriptionId);
  if (!existing) return null;

  const [subscription] = await updateRows<Subscription>(
    'subscriptions',
    { stripe_subscription_id: input.stripeSubscriptionId },
    {
      plan_id: input.planId ?? existing.plan_id,
      status: input.status,
      current_period_start: input.currentPeriodStart ?? existing.current_period_start,
      current_period_end: input.currentPeriodEnd ?? existing.current_period_end,
      trial_end: 'trialEnd' in input ? input.trialEnd : existing.trial_end,
      cancelled_at: 'cancelledAt' in input ? input.cancelledAt : existing.cancelled_at,
    },
  );

  await updateCustomer(existing.customer_id, {
    service_status: serviceStatusForSubscription(input.status),
  });

  return subscription ?? null;
}

function serviceStatusForSubscription(status: SubscriptionStatus): ServiceStatus {
  // Keep access during Stripe's configured payment-recovery grace period.
  if (status === 'active' || status === 'trialing' || status === 'past_due') return 'active';
  if (status === 'cancelled') return 'cancelled';
  return 'paused';
}

export async function listCustomers(filters: { status?: string; plan?: string } = {}) {
  const customers = await selectRows<Customer>(
    'customers',
    filters.status ? { service_status: filters.status } : undefined,
    { order: 'created_at.desc' },
  );

  if (!filters.plan) return customers;

  const subscriptions = await selectRows<Subscription>('subscriptions', { plan_id: filters.plan });
  const customerIds = new Set(subscriptions.map((subscription) => subscription.customer_id));
  return customers.filter((customer) => customerIds.has(customer.id));
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const [customer] = await selectRows<Customer>('customers', { id }, { limit: 1 });
  if (!customer) return null;

  const [subscriptions, onboardingSubmissions] = await Promise.all([
    selectRows<Subscription>('subscriptions', { customer_id: id }, { order: 'created_at.desc' }),
    selectRows<OnboardingSubmission>('onboarding_submissions', { customer_id: id }, { order: 'created_at.desc' }),
  ]);

  return {
    ...customer,
    subscriptions,
    onboarding_submissions: onboardingSubmissions,
  };
}

export async function getCustomerByEmail(email: string) {
  const [customer] = await selectRows<Customer>('customers', { email: email.trim().toLowerCase() }, { limit: 1 });
  return customer ?? null;
}

export async function updateCustomer(id: string, data: Partial<Pick<
  Customer,
  'name' | 'phone' | 'line_id' | 'store_name' | 'store_address' | 'store_city' | 'gbp_url' | 'website_url' | 'industry' | 'signature_items' | 'onboarding_status' | 'service_status'
>>) {
  const [customer] = await updateRows<Customer>('customers', { id }, data);
  return customer ?? null;
}

export async function createOnboardingSubmission(input: {
  customerId: string;
  gbpUrl: string;
  websiteUrl?: string;
  storeName: string;
  storeAddress?: string;
  storeCity?: string;
  phone?: string;
  lineId?: string;
  industry?: string;
  signatureItems: string[];
  ga4PropertyId?: string;
  metaPageId?: string;
  notes?: string;
}) {
  const customer = await updateCustomer(input.customerId, {
    store_name: input.storeName,
    store_address: input.storeAddress || null,
    store_city: input.storeCity || null,
    phone: input.phone || null,
    line_id: input.lineId || null,
    gbp_url: input.gbpUrl,
    website_url: input.websiteUrl || null,
    industry: input.industry || null,
    signature_items: input.signatureItems,
    onboarding_status: 'pending_review',
    service_status: 'pending_review',
  });

  const submission = await insertRow<OnboardingSubmission>('onboarding_submissions', {
    customer_id: input.customerId,
    status: 'pending_review',
    ga4_property_id: input.ga4PropertyId || null,
    meta_page_id: input.metaPageId || null,
    meta_admin_status: input.metaPageId ? 'invited' : null,
    notes: input.notes || null,
  });

  return { customer, submission };
}

export async function approveCustomerOnboarding(customerId: string, reviewer: string) {
  return reviewCustomerOnboarding(customerId, reviewer, 'approved');
}

export async function reviewCustomerOnboarding(
  customerId: string,
  reviewer: string,
  decision: OnboardingReviewDecision,
) {
  const [submission] = await selectRows<OnboardingSubmission>(
    'onboarding_submissions',
    { customer_id: customerId, status: 'pending_review' },
    { order: 'created_at.desc', limit: 1 },
  );

  if (submission) {
    await updateRows<OnboardingSubmission>(
      'onboarding_submissions',
      { id: submission.id },
      {
        status: decision,
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
      },
    );
  }

  return updateCustomer(customerId, {
    onboarding_status: decision,
    service_status: serviceStatusForOnboardingDecision(decision),
  });
}

function serviceStatusForOnboardingDecision(decision: OnboardingReviewDecision): ServiceStatus {
  if (decision === 'approved') return 'active';
  if (decision === 'needs_revision') return 'pending_onboarding';
  return 'paused';
}
