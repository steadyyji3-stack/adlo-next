import 'server-only';
import { selectRows, updateRows } from '@/lib/supabase-rest';
import { type Customer, listCustomers } from '@/lib/customers';

export type GbpReviewReplyStatus = 'pending' | 'drafted' | 'posted';

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
  reply_status: GbpReviewReplyStatus | null;
  created_at: string;
}

export interface GbpReviewWithCustomer extends GbpReview {
  customer: Pick<Customer, 'id' | 'store_name' | 'email' | 'service_status'> | null;
}

export async function listAdminGbpReviews(filters: { customerId?: string; replyStatus?: string; unanswered?: boolean } = {}) {
  const reviewFilters = {
    customer_id: filters.customerId,
    reply_status: filters.unanswered ? 'pending' : filters.replyStatus,
  };
  const reviews = await selectRows<GbpReview>('gbp_reviews', reviewFilters, { order: 'posted_at.desc', limit: 100 });
  return attachCustomers(reviews);
}

export async function getAdminGbpReview(id: string) {
  const [review] = await selectRows<GbpReview>('gbp_reviews', { id }, { limit: 1 });
  if (!review) return null;
  const [withCustomer] = await attachCustomers([review]);
  return withCustomer ?? null;
}

export async function updateGbpReviewReply(id: string, input: Partial<Pick<
  GbpReview,
  'reply_text' | 'reply_status' | 'reply_posted_at'
>>) {
  const [review] = await updateRows<GbpReview>('gbp_reviews', { id }, input);
  return review ?? null;
}

async function attachCustomers(reviews: GbpReview[]): Promise<GbpReviewWithCustomer[]> {
  if (reviews.length === 0) return [];

  const customers = await listCustomers();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return reviews.map((review) => {
    const customer = customerMap.get(review.customer_id);
    return {
      ...review,
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
