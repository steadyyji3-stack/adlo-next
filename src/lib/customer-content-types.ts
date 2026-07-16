import type { GeneratedPost } from '@/lib/gbp-post-writer';
import type { GeneratedBroadcast } from '@/lib/line-broadcast';
import type { StoreProfile } from '@/lib/store-profile';

export interface CustomerContentBundle {
  id: string;
  customer_id: string;
  week_start: string;
  profile_snapshot: StoreProfile;
  gbp_posts: GeneratedPost[];
  line_broadcasts: GeneratedBroadcast[];
  generated_at: string;
  updated_at: string;
}
