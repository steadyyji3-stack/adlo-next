import 'server-only';
import { selectRows } from '@/lib/supabase-rest';
import { getCustomerDetail, type CustomerDetail } from '@/lib/customers';

export interface GbpPost {
  id: string;
  customer_id: string;
  scheduled_for: string;
  posted_at: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  category: string;
  title: string;
  content: string;
  image_hint: string | null;
  image_url: string | null;
  cta_type: string | null;
  cta_url: string | null;
  google_post_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface GbpReview {
  id: string;
  customer_id: string;
  google_review_id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  posted_at: string | null;
  reply_text: string | null;
  reply_posted_at: string | null;
  reply_status: 'pending' | 'drafted' | 'posted' | null;
  created_at: string;
}

export interface KeywordRanking {
  id: string;
  customer_id: string;
  keyword: string;
  rank_position: number | null;
  search_volume: number | null;
  cpc_ntd: number | null;
  checked_at: string;
  source: 'google_search' | 'serp_api';
}

export interface MonthlyReport {
  id: string;
  customer_id: string;
  period_start: string;
  period_end: string;
  pdf_url: string;
  summary_json: Record<string, unknown>;
  sent_to_email: string | null;
  sent_at: string | null;
  generated_at: string;
}

export interface CustomerDashboardData {
  customer: CustomerDetail;
  latestSubscription: CustomerDetail['subscriptions'][number] | null;
  posts: GbpPost[];
  reviews: GbpReview[];
  rankings: KeywordRanking[];
  reports: MonthlyReport[];
  kpis: {
    postsThisMonth: number;
    postedThisMonth: number;
    newReviewsThisMonth: number;
    averageRating: number | null;
    unansweredReviews: number;
    averageRank: number | null;
  };
}

export async function getCustomerDashboardData(customerId: string): Promise<CustomerDashboardData | null> {
  const customer = await getCustomerDetail(customerId);
  if (!customer) return null;

  const [posts, reviews, rankings, reports] = await Promise.all([
    listCustomerPosts(customerId, 8),
    listCustomerReviews(customerId, 8),
    listCustomerRankings(customerId, 12),
    listCustomerReports(customerId, 6),
  ]);

  return {
    customer,
    latestSubscription: customer.subscriptions[0] ?? null,
    posts,
    reviews,
    rankings,
    reports,
    kpis: buildDashboardKpis(posts, reviews, rankings),
  };
}

export async function listCustomerPosts(customerId: string, limit = 20) {
  return selectRows<GbpPost>('gbp_posts', { customer_id: customerId }, { order: 'scheduled_for.desc', limit });
}

export async function listCustomerReviews(customerId: string, limit = 20) {
  return selectRows<GbpReview>('gbp_reviews', { customer_id: customerId }, { order: 'posted_at.desc', limit });
}

export async function listCustomerRankings(customerId: string, limit = 50) {
  return selectRows<KeywordRanking>('keyword_rankings', { customer_id: customerId }, { order: 'checked_at.desc', limit });
}

export async function listCustomerReports(customerId: string, limit = 20) {
  return selectRows<MonthlyReport>('monthly_reports', { customer_id: customerId }, { order: 'period_start.desc', limit });
}

function buildDashboardKpis(posts: GbpPost[], reviews: GbpReview[], rankings: KeywordRanking[]) {
  const now = new Date();
  const postsThisMonth = posts.filter((post) => isSameMonth(post.scheduled_for, now)).length;
  const postedThisMonth = posts.filter((post) => post.status === 'posted' && isSameMonth(post.posted_at, now)).length;
  const reviewsThisMonth = reviews.filter((review) => isSameMonth(review.posted_at, now));
  const ranked = latestRankingsByKeyword(rankings).filter((ranking) => ranking.rank_position !== null);

  return {
    postsThisMonth,
    postedThisMonth,
    newReviewsThisMonth: reviewsThisMonth.length,
    averageRating: average(reviewsThisMonth.map((review) => review.rating)),
    unansweredReviews: reviews.filter((review) => review.reply_status === 'pending' || !review.reply_status).length,
    averageRank: average(ranked.map((ranking) => ranking.rank_position ?? 0)),
  };
}

function latestRankingsByKeyword(rankings: KeywordRanking[]) {
  const seen = new Set<string>();
  return rankings.filter((ranking) => {
    if (seen.has(ranking.keyword)) return false;
    seen.add(ranking.keyword);
    return true;
  });
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function isSameMonth(value: string | null, date: Date) {
  if (!value) return false;
  const parsed = new Date(value);
  return parsed.getFullYear() === date.getFullYear() && parsed.getMonth() === date.getMonth();
}
