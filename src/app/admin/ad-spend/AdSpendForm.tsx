'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdSpendPlatform } from '@/lib/ad-spend';
import type { Customer } from '@/lib/customers';

const platforms: { value: AdSpendPlatform; label: string }[] = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_ads', label: 'Meta Ads' },
];

export function AdSpendForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [platform, setPlatform] = useState<AdSpendPlatform>('google_ads');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function saveAdSpend(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/ad-spend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          date: String(formData.get('date') ?? ''),
          platform,
          spend_ntd: numberValue(formData.get('spend_ntd')),
          impressions: optionalNumber(formData.get('impressions')),
          clicks: optionalNumber(formData.get('clicks')),
          conversions: optionalNumber(formData.get('conversions')),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '儲存廣告花費失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('儲存廣告花費失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={saveAdSpend} className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
      <Select value={customerId} onValueChange={setCustomerId}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="選擇客戶" />
        </SelectTrigger>
        <SelectContent>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>{customer.store_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="date" type="date" required />
      <Select value={platform} onValueChange={(value) => setPlatform(value as AdSpendPlatform)}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="spend_ntd" type="number" min={0} step="0.1" placeholder="花費 NTD" required />
      <Input name="impressions" type="number" min={0} placeholder="曝光" />
      <Input name="clicks" type="number" min={0} placeholder="點擊" />
      <Input name="conversions" type="number" min={0} placeholder="轉換" />
      <div className="flex items-center gap-3 md:col-span-3 xl:col-span-4">
        <Button type="submit" disabled={loading || !customerId} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <PlusCircle data-icon="inline-start" aria-hidden />}
          儲存廣告花費
        </Button>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </form>
  );
}

function numberValue(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? Number(text) : 0;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? Number(text) : null;
}
