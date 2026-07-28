import 'server-only';
import { z } from 'zod';
import type {
  BusinessType,
  StoreProfile,
  StoreProfileInput,
} from '@/lib/store-profile';
import { selectRows, upsertRow } from '@/lib/supabase-rest';

const businessTypes = ['在地店家', '電商品牌', '實體+電商'] as const;

export const customerStoreProfileInputSchema = z.object({
  storeName: z.string().trim().min(2, '店家名稱至少需要 2 個字').max(120),
  industry: z.string().trim().min(1, '請選擇或輸入行業').max(40)
    .transform((value) => value as StoreProfileInput['industry']),
  selectedTags: z.array(z.string().trim().min(1).max(60)).max(12),
  weekTheme: z.string().trim().max(120).optional(),
  businessType: z.enum(businessTypes).optional(),
  channels: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
}).strict();

interface CustomerStoreProfileRow {
  customer_id: string;
  profile: StoreProfile;
  created_at: string;
  updated_at: string;
}

function uniqueNonEmpty(values: string[] | undefined) {
  return Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
}

function normalizeProfile(input: StoreProfileInput): StoreProfile {
  return {
    storeName: input.storeName.trim(),
    industry: input.industry,
    selectedTags: uniqueNonEmpty(input.selectedTags),
    weekTheme: input.weekTheme?.trim() || undefined,
    businessType: (input.businessType ?? '在地店家') as BusinessType,
    channels: uniqueNonEmpty(input.channels),
    savedAt: new Date().toISOString(),
  };
}

export async function getCustomerStoreProfile(customerId: string) {
  const [row] = await selectRows<CustomerStoreProfileRow>(
    'customer_store_profiles',
    { customer_id: customerId },
    { limit: 1 },
  );
  return row?.profile ?? null;
}

export async function saveCustomerStoreProfile(customerId: string, input: StoreProfileInput) {
  const profile = normalizeProfile(input);
  await upsertRow<CustomerStoreProfileRow>(
    'customer_store_profiles',
    {
      customer_id: customerId,
      profile,
    },
    'customer_id',
  );
  return profile;
}
