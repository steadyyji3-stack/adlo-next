import 'server-only';
import { insertRow, selectRows } from '@/lib/supabase-rest';
import { type Customer, listCustomers } from '@/lib/customers';

export type RankingSource = 'google_search' | 'serp_api';

export interface KeywordRanking {
  id: string;
  customer_id: string;
  keyword: string;
  rank_position: number | null;
  search_volume: number | null;
  cpc_ntd: number | null;
  checked_at: string;
  source: RankingSource;
}

export interface KeywordRankingWithCustomer extends KeywordRanking {
  customer: Pick<Customer, 'id' | 'store_name' | 'email' | 'service_status'> | null;
}

export async function listAdminKeywordRankings(filters: { customerId?: string; keyword?: string } = {}) {
  const rankings = await selectRows<KeywordRanking>(
    'keyword_rankings',
    { customer_id: filters.customerId, keyword: filters.keyword },
    { order: 'checked_at.desc', limit: 200 },
  );
  return attachCustomers(rankings);
}

export async function createKeywordRanking(input: {
  customerId: string;
  keyword: string;
  rankPosition?: number | null;
  searchVolume?: number | null;
  cpcNtd?: number | null;
  checkedAt: string;
  source: RankingSource;
}) {
  return insertRow<KeywordRanking>('keyword_rankings', {
    customer_id: input.customerId,
    keyword: input.keyword,
    rank_position: input.rankPosition ?? null,
    search_volume: input.searchVolume ?? null,
    cpc_ntd: input.cpcNtd ?? null,
    checked_at: input.checkedAt,
    source: input.source,
  });
}

export function summarizeLatestRankings(rankings: KeywordRankingWithCustomer[]) {
  const latestByCustomerKeyword = new Map<string, KeywordRankingWithCustomer>();
  for (const ranking of rankings) {
    const key = `${ranking.customer_id}:${ranking.keyword}`;
    if (!latestByCustomerKeyword.has(key)) latestByCustomerKeyword.set(key, ranking);
  }

  const latest = Array.from(latestByCustomerKeyword.values());
  const ranked = latest.filter((ranking) => ranking.rank_position !== null);
  return {
    trackedKeywords: latest.length,
    top3: ranked.filter((ranking) => ranking.rank_position !== null && ranking.rank_position <= 3).length,
    top10: ranked.filter((ranking) => ranking.rank_position !== null && ranking.rank_position <= 10).length,
    averageRank: ranked.length
      ? Number((ranked.reduce((sum, ranking) => sum + (ranking.rank_position ?? 0), 0) / ranked.length).toFixed(1))
      : null,
  };
}

async function attachCustomers(rankings: KeywordRanking[]): Promise<KeywordRankingWithCustomer[]> {
  if (rankings.length === 0) return [];

  const customers = await listCustomers();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return rankings.map((ranking) => {
    const customer = customerMap.get(ranking.customer_id);
    return {
      ...ranking,
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
