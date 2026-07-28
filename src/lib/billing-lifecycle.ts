import type Stripe from 'stripe';
import type {
  OnboardingStatus,
  ServiceStatus,
  SubscriptionStatus,
} from '@/lib/customers';

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSubscription === 'string') return parentSubscription;
  if (parentSubscription?.id) return parentSubscription.id;

  // Compatibility for events created with an older Stripe API version.
  const legacyInvoice = invoice as Stripe.Invoice & {
    subscription?: string | { id?: string } | null;
  };
  if (typeof legacyInvoice.subscription === 'string') return legacyInvoice.subscription;
  return legacyInvoice.subscription?.id ?? null;
}

export function serviceStatusForSubscription(
  status: SubscriptionStatus,
  onboardingStatus: OnboardingStatus,
): ServiceStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'unpaid' || status === 'paused' || status === 'incomplete') return 'paused';

  if (onboardingStatus === 'approved') return 'active';
  if (onboardingStatus === 'pending_review') return 'pending_review';
  if (onboardingStatus === 'rejected') return 'paused';
  return 'pending_onboarding';
}

export function shouldNotifyPaymentRecovered(input: {
  previousStatus: SubscriptionStatus | null;
  attemptCount: number;
  hadPaymentAttention: boolean;
}) {
  return input.hadPaymentAttention
    || input.attemptCount > 1
    || input.previousStatus === 'past_due'
    || input.previousStatus === 'incomplete'
    || input.previousStatus === 'unpaid';
}
