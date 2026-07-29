import 'server-only';

import { listCustomerGrowthCycles } from '@/lib/customer-growth-cycles';
import { buildCustomerOutcomeTimeline } from '@/lib/customer-outcome-timeline';
import { listCustomerReviewDrafts } from '@/lib/customer-review-workspace';
import { selectRows } from '@/lib/supabase-rest';

interface SiteScanRow {
  id: string;
  hostname: string;
  overall_score: number;
  page_count: number;
  scanned_at: string;
}

interface MonthlyReportRow {
  id: string;
  period_start: string;
  period_end: string;
  sent_at: string | null;
  generated_at: string;
}

export async function getCustomerOutcomeTimeline(customerId: string, limit = 30) {
  const sourceLimit = Math.max(limit, 30);
  const [growthCycles, siteScans, reviewDrafts, reports] = await Promise.all([
    listCustomerGrowthCycles(customerId, sourceLimit),
    selectRows<SiteScanRow>(
      'customer_site_optimizer_scans',
      { customer_id: customerId },
      {
        select: 'id,hostname,overall_score,page_count,scanned_at',
        order: 'scanned_at.desc',
        limit: sourceLimit,
      },
    ),
    listCustomerReviewDrafts(customerId, sourceLimit),
    selectRows<MonthlyReportRow>(
      'monthly_reports',
      { customer_id: customerId },
      {
        select: 'id,period_start,period_end,sent_at,generated_at',
        order: 'generated_at.desc',
        limit: sourceLimit,
      },
    ),
  ]);

  return buildCustomerOutcomeTimeline({
    growthCycles,
    siteScans,
    reviewDrafts,
    reports,
    limit,
  });
}
