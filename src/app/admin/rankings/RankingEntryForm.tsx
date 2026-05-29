'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer } from '@/lib/customers';
import type { RankingSource } from '@/lib/keyword-rankings';

export function RankingEntryForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [source, setSource] = useState<RankingSource>('google_search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createRanking(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const checkedAt = new Date(String(formData.get('checked_at')));
      const response = await fetch('/api/admin/rankings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          keyword: String(formData.get('keyword') ?? ''),
          rank_position: optionalNumber(formData.get('rank_position')),
          search_volume: optionalNumber(formData.get('search_volume')),
          cpc_ntd: optionalNumber(formData.get('cpc_ntd')),
          checked_at: checkedAt.toISOString(),
          source,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '新增排名失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('新增排名失敗，請確認檢查時間格式');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={createRanking} className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
      <Input name="keyword" placeholder="關鍵字" required />
      <Input name="checked_at" type="datetime-local" required />
      <Input name="rank_position" type="number" min={1} max={100} placeholder="排名 1-100，空白代表 100+" />
      <Input name="search_volume" type="number" min={0} placeholder="搜尋量（選填）" />
      <Input name="cpc_ntd" type="number" min={0} step="0.1" placeholder="CPC NTD（選填）" />
      <Select value={source} onValueChange={(value) => setSource(value as RankingSource)}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="google_search">Google Search</SelectItem>
          <SelectItem value="serp_api">SERP API</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={loading || !customerId} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <PlusCircle data-icon="inline-start" aria-hidden />}
          新增排名紀錄
        </Button>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </form>
  );
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  return Number(text);
}
