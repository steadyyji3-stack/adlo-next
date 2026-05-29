import 'server-only';
import { getCustomerDetail, type CustomerDetail } from '@/lib/customers';
import { selectRows } from '@/lib/supabase-rest';

export interface ReportPeriod {
  month: string;
  label: string;
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
}

interface GbpPostRow {
  id: string;
  customer_id: string;
  scheduled_for: string;
  posted_at: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  category: string;
  title: string;
  content: string;
  created_at: string;
}

interface GbpReviewRow {
  id: string;
  customer_id: string;
  reviewer_name: string | null;
  rating: number;
  comment: string | null;
  posted_at: string | null;
  reply_text: string | null;
  reply_posted_at: string | null;
  reply_status: 'pending' | 'drafted' | 'posted' | null;
  created_at: string;
}

interface KeywordRankingRow {
  id: string;
  customer_id: string;
  keyword: string;
  rank_position: number | null;
  checked_at: string;
  source: 'google_search' | 'serp_api';
}

interface AdSpendRow {
  id: string;
  customer_id: string;
  date: string;
  platform: 'google_ads' | 'meta_ads';
  spend_ntd: number;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
}

export interface MonthlyReportPreview {
  customer: CustomerDetail;
  period: ReportPeriod;
  metrics: {
    gbpPostsPublished: number;
    gbpPostsScheduled: number;
    reviewsNew: number;
    reviewsReplied: number;
    averageRating: number | null;
    averageRank: number | null;
    previousAverageRank: number | null;
    rankDelta: number | null;
    adSpendNtd: number;
    adClicks: number;
    adConversions: number;
  };
  completedItems: string[];
  nextActions: string[];
  customerRequests: string[];
  recentPosts: Array<Pick<GbpPostRow, 'id' | 'title' | 'category' | 'status' | 'scheduled_for' | 'posted_at'>>;
  recentReviews: Array<Pick<GbpReviewRow, 'id' | 'reviewer_name' | 'rating' | 'comment' | 'reply_status' | 'posted_at'>>;
  latestRankings: Array<Pick<KeywordRankingRow, 'id' | 'keyword' | 'rank_position' | 'checked_at'>>;
}

export function getReportPeriod(month = currentMonthString()): ReportPeriod {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('INVALID_REPORT_MONTH');
  }

  const [year, monthIndex] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, monthIndex - 1, 1));
  const endDate = new Date(Date.UTC(year, monthIndex, 0, 23, 59, 59, 999));
  const previousStart = new Date(Date.UTC(year, monthIndex - 2, 1));
  const previousEnd = new Date(Date.UTC(year, monthIndex - 1, 0, 23, 59, 59, 999));

  return {
    month,
    label: startDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', timeZone: 'UTC' }),
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    previousStart: previousStart.toISOString(),
    previousEnd: previousEnd.toISOString(),
  };
}

export async function buildMonthlyReportPreview(customerId: string, month?: string): Promise<MonthlyReportPreview | null> {
  const period = getReportPeriod(month);
  const customer = await getCustomerDetail(customerId);
  if (!customer) return null;

  const [posts, reviews, rankings, adSpend] = await Promise.all([
    selectRows<GbpPostRow>('gbp_posts', { customer_id: customerId }, { order: 'scheduled_for.desc', limit: 160 }),
    selectRows<GbpReviewRow>('gbp_reviews', { customer_id: customerId }, { order: 'posted_at.desc', limit: 160 }),
    selectRows<KeywordRankingRow>('keyword_rankings', { customer_id: customerId }, { order: 'checked_at.desc', limit: 240 }),
    selectRows<AdSpendRow>('ad_spend_daily', { customer_id: customerId }, { order: 'date.desc', limit: 120 }),
  ]);

  const currentPosts = posts.filter((post) => inRange(post.posted_at ?? post.scheduled_for, period.start, period.end));
  const currentReviews = reviews.filter((review) => inRange(review.posted_at ?? review.created_at, period.start, period.end));
  const currentRankings = latestRankingsInRange(rankings, period.start, period.end);
  const previousRankings = latestRankingsInRange(rankings, period.previousStart, period.previousEnd);
  const currentAdSpend = adSpend.filter((row) => inRange(row.date, period.start, period.end));

  const averageRank = average(currentRankings.map((ranking) => ranking.rank_position).filter((rank): rank is number => rank !== null));
  const previousAverageRank = average(previousRankings.map((ranking) => ranking.rank_position).filter((rank): rank is number => rank !== null));

  const metrics = {
    gbpPostsPublished: currentPosts.filter((post) => post.status === 'posted').length,
    gbpPostsScheduled: currentPosts.filter((post) => post.status === 'scheduled').length,
    reviewsNew: currentReviews.length,
    reviewsReplied: currentReviews.filter((review) => review.reply_status === 'posted').length,
    averageRating: average(currentReviews.map((review) => review.rating)),
    averageRank,
    previousAverageRank,
    rankDelta: averageRank !== null && previousAverageRank !== null ? Number((previousAverageRank - averageRank).toFixed(1)) : null,
    adSpendNtd: sum(currentAdSpend.map((row) => Number(row.spend_ntd))),
    adClicks: sum(currentAdSpend.map((row) => row.clicks ?? 0)),
    adConversions: sum(currentAdSpend.map((row) => row.conversions ?? 0)),
  };

  return {
    customer,
    period,
    metrics,
    completedItems: buildCompletedItems(customer, metrics),
    nextActions: buildNextActions(customer, metrics),
    customerRequests: buildCustomerRequests(customer),
    recentPosts: currentPosts.slice(0, 6).map(({ id, title, category, status, scheduled_for, posted_at }) => ({ id, title, category, status, scheduled_for, posted_at })),
    recentReviews: currentReviews.slice(0, 5).map(({ id, reviewer_name, rating, comment, reply_status, posted_at }) => ({ id, reviewer_name, rating, comment, reply_status, posted_at })),
    latestRankings: currentRankings.slice(0, 10).map(({ id, keyword, rank_position, checked_at }) => ({ id, keyword, rank_position, checked_at })),
  };
}

function buildCompletedItems(customer: CustomerDetail, metrics: MonthlyReportPreview['metrics']) {
  const items = [
    `本月發布 ${metrics.gbpPostsPublished} 則 GBP 貼文，另有 ${metrics.gbpPostsScheduled} 則已排程。`,
    `本月新增 ${metrics.reviewsNew} 則評論，已回覆 ${metrics.reviewsReplied} 則。`,
  ];
  if (customer.subscriptions[0]?.plan_id === 'local-seo') {
    items.push('Local SEO Pack 關鍵字追蹤已納入月報摘要。');
  }
  if (customer.subscriptions[0]?.plan_id === 'ads-managed') {
    items.push(`Ads Managed 本月已彙整 NT$${metrics.adSpendNtd.toLocaleString('zh-TW')} 廣告花費。`);
  }
  return items;
}

function buildNextActions(customer: CustomerDetail, metrics: MonthlyReportPreview['metrics']) {
  const actions = ['延續本月表現最佳的 GBP 貼文主題，安排下月內容節奏。'];
  if ((metrics.averageRating ?? 5) < 4.5) actions.push('優先整理低星評論情境，補強回覆口吻與現場服務 SOP。');
  if (metrics.rankDelta !== null && metrics.rankDelta < 0) actions.push('針對排名下滑關鍵字補內容深度與 GBP 問答素材。');
  if (customer.subscriptions[0]?.plan_id === 'ads-managed') actions.push('檢視高點擊低轉換的廣告素材，提出下月素材測試方向。');
  return actions;
}

function buildCustomerRequests(customer: CustomerDetail) {
  const requests = ['提供下月主打商品、活動或檔期資訊。'];
  if (!customer.gbp_url) requests.push('補上 Google 商家檔案連結，方便 adlo 串接 GBP 成效資料。');
  if (!customer.signature_items?.length) requests.push('補齊 5 個招牌商品/服務，讓貼文素材更貼近實際銷售。');
  return requests;
}

function latestRankingsInRange(rankings: KeywordRankingRow[], start: string, end: string) {
  const seen = new Set<string>();
  return rankings
    .filter((ranking) => inRange(ranking.checked_at, start, end))
    .filter((ranking) => {
      if (seen.has(ranking.keyword)) return false;
      seen.add(ranking.keyword);
      return true;
    });
}

function inRange(value: string | null, start: string, end: string) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= new Date(start).getTime() && time <= new Date(end).getTime();
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return Number((sum(values) / values.length).toFixed(1));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function currentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
