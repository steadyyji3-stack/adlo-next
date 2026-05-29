'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/lib/customers';

const categories = ['促銷', '教育', 'QA', '幕後', '節慶', '案例'];

export function PostDraftForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [category, setCategory] = useState(categories[0]);
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');

  async function createPost(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const scheduledAt = new Date(String(formData.get('scheduled_for')));
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          scheduled_for: scheduledAt.toISOString(),
          status,
          category,
          title: String(formData.get('title') ?? ''),
          content: String(formData.get('content') ?? ''),
          image_hint: optionalString(formData.get('image_hint')),
          cta_type: optionalString(formData.get('cta_type')),
          cta_url: optionalString(formData.get('cta_url')),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '建立貼文失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('建立貼文失敗，請確認排程時間格式');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={createPost} className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
      <Input name="scheduled_for" type="datetime-local" required />
      <Input name="title" placeholder="貼文標題" required className="md:col-span-2" />
      <Textarea name="content" placeholder="貼文內容" required className="min-h-32 resize-none md:col-span-2" />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'scheduled')}>
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">草稿</SelectItem>
          <SelectItem value="scheduled">已排程</SelectItem>
        </SelectContent>
      </Select>
      <Input name="image_hint" placeholder="圖片提示（選填）" />
      <Input name="cta_type" placeholder="CTA 類型（選填）" />
      <Input name="cta_url" placeholder="CTA URL（選填）" className="md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={loading || !customerId} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <PlusCircle data-icon="inline-start" aria-hidden />}
          建立文案
        </Button>
        {error && <p className="text-sm text-rose-700">{error}</p>}
      </div>
    </form>
  );
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text || null;
}
