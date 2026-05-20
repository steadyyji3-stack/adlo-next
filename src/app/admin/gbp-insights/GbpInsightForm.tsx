'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer } from '@/lib/customers';
import type { GbpInsightsSource } from '@/lib/gbp-insights';

const sources: { value: GbpInsightsSource; label: string }[] = [
  { value: 'manual', label: '手動' },
  { value: 'imported', label: '匯入' },
  { value: 'gbp_api', label: 'GBP API' },
];

export function GbpInsightForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [source, setSource] = useState<GbpInsightsSource>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createInsight(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/gbp-insights', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          date: String(formData.get('date') ?? ''),
          business_impressions: numberValue(formData.get('business_impressions')),
          website_clicks: numberValue(formData.get('website_clicks')),
          phone_calls: numberValue(formData.get('phone_calls')),
          direction_requests: numberValue(formData.get('direction_requests')),
          messages: numberValue(formData.get('messages')),
          source,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '新增 GBP 洞察失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('新增 GBP 洞察失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={createInsight} className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
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
      <Select value={source} onValueChange={(value) => setSource(value as GbpInsightsSource)}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sources.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input name="business_impressions" type="number" min={0} placeholder="GBP 曝光" />
      <Input name="website_clicks" type="number" min={0} placeholder="網站點擊" />
      <Input name="phone_calls" type="number" min={0} placeholder="電話點擊" />
      <Input name="direction_requests" type="number" min={0} placeholder="路線請求" />
      <Input name="messages" type="number" min={0} placeholder="訊息" />
      <div className="flex items-center gap-3 md:col-span-3 xl:col-span-4">
        <Button type="submit" disabled={loading || !customerId} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <BarChart3 data-icon="inline-start" aria-hidden />}
          新增洞察
        </Button>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </form>
  );
}

function numberValue(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  if (!text) return 0;
  return Number(text);
}
