import 'server-only';
import { insertRow, selectRows } from '@/lib/supabase-rest';
import { type Customer, listCustomers } from '@/lib/customers';

export type GbpInsightsSource = 'manual' | 'gbp_api' | 'imported';

export interface GbpInsightDaily {
  id: string;
  customer_id: string;
  date: string;
  business_impressions: number;
  website_clicks: number;
  phone_calls: number;
  direction_requests: number;
  messages: number;
  source: GbpInsightsSource;
  created_at: string;
  updated_at: string;
}

export interface GbpInsightDailyWithCustomer extends GbpInsightDaily {
  customer: Pick<Customer, 'id' | 'store_name' | 'email' | 'service_status'> | null;
}

export interface GbpInsightsSummary {
  totalImpressions: number;
  totalActions: number;
  websiteClicks: number;
  phoneCalls: number;
  directionRequests: number;
  messages: number;
}

export async function listAdminGbpInsights(filters: { customerId?: string } = {}) {
  const insights = await selectRows<GbpInsightDaily>(
    'gbp_insights_daily',
    { customer_id: filters.customerId },
    { order: 'date.desc', limit: 200 },
  );
  return attachCustomers(insights);
}

export async function createGbpInsight(input: {
  customerId: string;
  date: string;
  businessImpressions: number;
  websiteClicks: number;
  phoneCalls: number;
  directionRequests: number;
  messages: number;
  source?: GbpInsightsSource;
}) {
  return insertRow<GbpInsightDaily>('gbp_insights_daily', {
    customer_id: input.customerId,
    date: input.date,
    business_impressions: input.businessImpressions,
    website_clicks: input.websiteClicks,
    phone_calls: input.phoneCalls,
    direction_requests: input.directionRequests,
    messages: input.messages,
    source: input.source ?? 'manual',
  });
}

export function summarizeGbpInsights(insights: GbpInsightDaily[]): GbpInsightsSummary {
  return insights.reduce<GbpInsightsSummary>(
    (summary, insight) => {
      summary.totalImpressions += insight.business_impressions;
      summary.websiteClicks += insight.website_clicks;
      summary.phoneCalls += insight.phone_calls;
      summary.directionRequests += insight.direction_requests;
      summary.messages += insight.messages;
      summary.totalActions += insight.website_clicks + insight.phone_calls + insight.direction_requests + insight.messages;
      return summary;
    },
    {
      totalImpressions: 0,
      totalActions: 0,
      websiteClicks: 0,
      phoneCalls: 0,
      directionRequests: 0,
      messages: 0,
    },
  );
}

async function attachCustomers(insights: GbpInsightDaily[]): Promise<GbpInsightDailyWithCustomer[]> {
  if (insights.length === 0) return [];

  const customers = await listCustomers();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return insights.map((insight) => {
    const customer = customerMap.get(insight.customer_id);
    return {
      ...insight,
      customer: customer
        ? {
          id: customer.id,
          store_name: customer.store_name,
          email: customer.email,
          service_status: customer.service_status,
        }
        : null,
    };
  });
}
