'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/lib/customers';
import type { CopyAssetChannel, CopyAssetStatus } from '@/lib/copy-assets';

const channels: { value: CopyAssetChannel; label: string }[] = [
  { value: 'gbp_post', label: 'GBP 貼文' },
  { value: 'review_reply', label: '評論回覆' },
  { value: 'monthly_report', label: '月報' },
  { value: 'ads_copy', label: '廣告文案' },
];

const statuses: { value: CopyAssetStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'approved', label: '已核准' },
  { value: 'archived', label: '封存' },
];

export function CopyAssetForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState('global');
  const [channel, setChannel] = useState<CopyAssetChannel>('gbp_post');
  const [status, setStatus] = useState<CopyAssetStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createAsset(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/copy-library', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId === 'global' ? null : customerId,
          channel,
          title: String(formData.get('title') ?? ''),
          body: String(formData.get('body') ?? ''),
          tone: optionalText(formData.get('tone')),
          category: optionalText(formData.get('category')),
          status,
          tags: splitTags(formData.get('tags')),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '新增文案失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('新增文案失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={createAsset} className="grid grid-cols-1 gap-3 lg:grid-cols-4">
      <Select value={customerId} onValueChange={setCustomerId}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="適用客戶" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">通用素材</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>{customer.store_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={channel} onValueChange={(value) => setChannel(value as CopyAssetChannel)}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {channels.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="title" placeholder="文案標題" required />
      <Input name="category" placeholder="分類（選填）" />
      <Input name="tone" placeholder="語氣（例：溫暖、專業）" />
      <Input name="tags" placeholder="標籤，以逗號分隔" />
      <Select value={status} onValueChange={(value) => setStatus(value as CopyAssetStatus)}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="lg:col-span-4">
        <Textarea name="body" minLength={1} maxLength={3000} placeholder="文案內容" required className="min-h-32 bg-white" />
      </div>
      <div className="flex items-center gap-3 lg:col-span-4">
        <Button type="submit" disabled={loading} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <PlusCircle data-icon="inline-start" aria-hidden />}
          新增文案
        </Button>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </form>
  );
}

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text || null;
}

function splitTags(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  if (!text) return [];
  return text.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12);
}
