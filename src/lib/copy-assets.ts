import 'server-only';
import { insertRow, selectRows, updateRows } from '@/lib/supabase-rest';
import { type Customer, listCustomers } from '@/lib/customers';

export type CopyAssetChannel = 'gbp_post' | 'review_reply' | 'monthly_report' | 'ads_copy';
export type CopyAssetStatus = 'draft' | 'approved' | 'archived';
export type CopyAssetSource = 'manual' | 'groq' | 'imported';

export interface CopyAsset {
  id: string;
  customer_id: string | null;
  channel: CopyAssetChannel;
  title: string;
  body: string;
  tone: string | null;
  category: string | null;
  status: CopyAssetStatus;
  source: CopyAssetSource;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CopyAssetWithCustomer extends CopyAsset {
  customer: Pick<Customer, 'id' | 'store_name' | 'email' | 'service_status'> | null;
}

export async function listAdminCopyAssets(filters: {
  customerId?: string;
  channel?: CopyAssetChannel;
  status?: CopyAssetStatus;
} = {}) {
  const assets = await selectRows<CopyAsset>(
    'copy_assets',
    {
      customer_id: filters.customerId,
      channel: filters.channel,
      status: filters.status,
    },
    { order: 'created_at.desc', limit: 200 },
  );
  return attachCustomers(assets);
}

export async function createCopyAsset(input: {
  customerId?: string | null;
  channel: CopyAssetChannel;
  title: string;
  body: string;
  tone?: string | null;
  category?: string | null;
  status?: CopyAssetStatus;
  source?: CopyAssetSource;
  tags?: string[] | null;
}) {
  return insertRow<CopyAsset>('copy_assets', {
    customer_id: input.customerId || null,
    channel: input.channel,
    title: input.title,
    body: input.body,
    tone: input.tone || null,
    category: input.category || null,
    status: input.status ?? 'draft',
    source: input.source ?? 'manual',
    tags: input.tags?.length ? input.tags : null,
  });
}

export async function updateCopyAsset(id: string, data: Partial<Pick<
  CopyAsset,
  'customer_id' | 'channel' | 'title' | 'body' | 'tone' | 'category' | 'status' | 'source' | 'tags'
>>) {
  const [asset] = await updateRows<CopyAsset>('copy_assets', { id }, data);
  return asset ?? null;
}

async function attachCustomers(assets: CopyAsset[]): Promise<CopyAssetWithCustomer[]> {
  if (assets.length === 0) return [];

  const customerIds = new Set(assets.map((asset) => asset.customer_id).filter(Boolean));
  if (customerIds.size === 0) {
    return assets.map((asset) => ({ ...asset, customer: null }));
  }

  const customers = await listCustomers();
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  return assets.map((asset) => {
    const customer = asset.customer_id ? customerMap.get(asset.customer_id) : null;
    return {
      ...asset,
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
