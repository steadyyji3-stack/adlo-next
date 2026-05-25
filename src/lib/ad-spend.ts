import 'server-only';
import { selectRows, upsertRow } from '@/lib/supabase-rest';
import { type Customer, listCustomers } from '@/lib/customers';

export type AdSpendPlatform = 'google_ads' | 'meta_ads';

export interface AdSpendDaily {
  id: string;
  customer_id: string;
  date: string;
  platform: AdSpendPlatform;
  spend_ntd: number;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  created_at: string;
}

export interface AdSpendDailyWithCustomer extends AdSpendDaily {
  customer: Pick<Customer, 'id' | 'store_name' | 'email' | 'service_status'> | null;
}

export interface AdSpendSummary {
  totalSpendNtd: number;
  impressions: number;
  clicks: number;
  conversions: number;
  averageCpcNtd: number | null;
}

export async function listAdminAdSpend(filters: { customerId?: string; platform?: AdSpendPlatform } = {}) {
  const rows = await selectRows<AdSpendDaily>(
    'ad_spend_daily',
    { customer_id: filters.customerId, platform: filters.platform },
    { order: 'date.desc', limit: 200 },
  );
  return attachCustomers(rows);
}

export async function upsertAdSpendDaily(input: {
  customerId: string;
  date: string;
  platform: AdSpendPlatform;
  spendNtd: number;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
}) {
  return upsertRow<AdSpendDaily>(
    'ad_spend_daily',
    {
      customer_id: input.customerId,
      date: input.date,
      platform: input.platform,
      spend_ntd: input.spendNtd,
      impressions: input.impressions ?? null,
      clicks: input.clicks ?? null,
      conversions: input.conversions ?? null,
    },
    'customer_id,date,platform',
  );
}

export function summarizeAdSpend(rows: AdSpendDaily[]): AdSpendSummary {
  const summary = rows.reduce<AdSpendSummary>(
    (acc, row) => {
      acc.totalSpendNtd += Number(row.spend_ntd);
      acc.impressions += row.impressions ?? 0;
      acc.clicks += row.clicks ?? 0;
      acc.conversions += row.conversions ?? 0;
      return acc;
    },
    {
      totalSpendNtd: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      averageCpcNtd: null,
    },
  );

  return {
    ...summary,
    totalSpendNtd: Number(summary.totalSpendNtd.toFixed(1)),
    averageCpcNtd: summary.clicks > 0 ? Number((summary.totalSpendNtd / summary.clicks).toFixed(1)) : null,
  };
}

async function attachCustomers(rows: AdSpendDaily[]): Promise<AdSpendDailyWithCustomer[]> {
  if (rows.length === 0) return [];

  const customers = await listCustomers();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return rows.map((row) => {
    const customer = customerMap.get(row.customer_id);
    return {
      ...row,
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
