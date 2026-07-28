import 'server-only';
import { generatePosts } from '@/lib/gbp-post-writer';
import { generateBroadcasts } from '@/lib/line-broadcast';
import type { StoreProfile } from '@/lib/store-profile';
import type { CustomerContentBundle } from '@/lib/customer-content-types';
import { selectRows, upsertRow } from '@/lib/supabase-rest';

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function currentTaipeiWeekStart(now = new Date()) {
  const taipei = new Date(now.getTime() + TAIPEI_OFFSET_MS);
  const daysSinceMonday = (taipei.getUTCDay() + 6) % 7;
  taipei.setUTCDate(taipei.getUTCDate() - daysSinceMonday);
  return taipei.toISOString().slice(0, 10);
}

export async function listCustomerContentBundles(customerId: string, limit = 12) {
  return selectRows<CustomerContentBundle>(
    'customer_content_bundles',
    { customer_id: customerId },
    { order: 'week_start.desc', limit },
  );
}

export async function generateCustomerContentBundle(
  customerId: string,
  profile: StoreProfile,
) {
  const input = {
    storeName: profile.storeName,
    industry: profile.industry,
    selectedTags: profile.selectedTags,
    weekTheme: profile.weekTheme,
  };
  const weekStart = currentTaipeiWeekStart();

  return upsertRow<CustomerContentBundle>(
    'customer_content_bundles',
    {
      customer_id: customerId,
      week_start: weekStart,
      profile_snapshot: profile,
      gbp_posts: generatePosts(input),
      line_broadcasts: generateBroadcasts(input),
      generated_at: new Date().toISOString(),
    },
    'customer_id,week_start',
  );
}
