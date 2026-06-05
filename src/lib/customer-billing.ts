import 'server-only';
import type { CustomerDetail } from '@/lib/customers';
import { getCustomerDetail } from '@/lib/customers';
import { getStripe } from '@/lib/stripe';

export interface CustomerSubscriptionSnapshot {
  customer: {
    id: string;
    email: string;
    name: string;
    store_name: string;
    service_status: CustomerDetail['service_status'];
  };
  subscription: CustomerDetail['subscriptions'][number] | null;
}

export async function getCustomerSubscriptionSnapshot(customerId: string): Promise<CustomerSubscriptionSnapshot | null> {
  const customer = await getCustomerDetail(customerId);
  if (!customer) return null;

  return {
    customer: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      store_name: customer.store_name,
      service_status: customer.service_status,
    },
    subscription: customer.subscriptions[0] ?? null,
  };
}

export async function createCustomerPortalSession(input: {
  customerId: string;
  returnUrl: string;
}) {
  const customer = await getCustomerDetail(input.customerId);
  if (!customer) return null;

  const session = await getStripe().billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: input.returnUrl,
  });

  return {
    customer,
    session,
  };
}
