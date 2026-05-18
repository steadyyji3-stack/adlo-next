import 'server-only';
import { insertRow, selectRows, updateRows } from '@/lib/supabase-rest';
import { type Customer, listCustomers } from '@/lib/customers';

export type GbpPostStatus = 'draft' | 'scheduled' | 'posted' | 'failed';

export interface GbpPost {
  id: string;
  customer_id: string;
  scheduled_for: string;
  posted_at: string | null;
  status: GbpPostStatus;
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

export interface GbpPostWithCustomer extends GbpPost {
  customer: Pick<Customer, 'id' | 'store_name' | 'email' | 'service_status'> | null;
}

export async function listAdminGbpPosts(filters: { customerId?: string; status?: string } = {}) {
  const postFilters = {
    customer_id: filters.customerId,
    status: filters.status,
  };
  const posts = await selectRows<GbpPost>('gbp_posts', postFilters, { order: 'scheduled_for.desc', limit: 100 });
  return attachCustomers(posts);
}

export async function getAdminGbpPost(id: string) {
  const [post] = await selectRows<GbpPost>('gbp_posts', { id }, { limit: 1 });
  if (!post) return null;
  const [withCustomer] = await attachCustomers([post]);
  return withCustomer ?? null;
}

export async function createGbpPostDraft(input: {
  customerId: string;
  scheduledFor: string;
  status: Extract<GbpPostStatus, 'draft' | 'scheduled'>;
  category: string;
  title: string;
  content: string;
  imageHint?: string | null;
  ctaType?: string | null;
  ctaUrl?: string | null;
}) {
  return insertRow<GbpPost>('gbp_posts', {
    customer_id: input.customerId,
    scheduled_for: input.scheduledFor,
    status: input.status,
    category: input.category,
    title: input.title,
    content: input.content,
    image_hint: input.imageHint ?? null,
    cta_type: input.ctaType ?? null,
    cta_url: input.ctaUrl ?? null,
  });
}

export async function updateGbpPost(id: string, input: Partial<Pick<
  GbpPost,
  'scheduled_for' | 'status' | 'category' | 'title' | 'content' | 'image_hint' | 'image_url' | 'cta_type' | 'cta_url' | 'error_message'
>>) {
  const [post] = await updateRows<GbpPost>('gbp_posts', { id }, input);
  return post ?? null;
}

async function attachCustomers(posts: GbpPost[]): Promise<GbpPostWithCustomer[]> {
  if (posts.length === 0) return [];

  const customers = await listCustomers();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return posts.map((post) => {
    const customer = customerMap.get(post.customer_id);
    return {
      ...post,
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
