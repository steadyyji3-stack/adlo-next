'use client';

import { useState } from 'react';
import { Check, Copy, LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer } from '@/lib/customers';

type Destination = 'dashboard' | 'billing' | 'onboarding';

const destinations: { value: Destination; label: string }[] = [
  { value: 'dashboard', label: '客戶 Dashboard' },
  { value: 'billing', label: '訂閱管理' },
  { value: 'onboarding', label: 'Onboarding 表單' },
];

export function CustomerLinkForm({ customers }: { customers: Customer[] }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [destination, setDestination] = useState<Destination>('dashboard');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  async function createLink() {
    if (!customerId) {
      setError('請先選擇客戶');
      return;
    }

    setLoading(true);
    setCopied(false);
    setError('');
    setGeneratedUrl('');

    try {
      const response = await fetch('/api/admin/customer-links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          destination,
          expires_in_days: expiresInDays,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '產生客戶連結失敗');
        return;
      }
      setGeneratedUrl(data.url);
      setExpiresAt(data.expires_at);
    } catch {
      setError('產生客戶連結失敗');
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!generatedUrl) return;

    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_160px_auto]">
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="選擇客戶" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.store_name} / {customer.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={destination} onValueChange={(value) => setDestination(value as Destination)}>
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={1}
          max={90}
          value={expiresInDays}
          onChange={(event) => setExpiresInDays(Number(event.target.value))}
          aria-label="有效天數"
          className="bg-white"
        />

        <Button
          type="button"
          disabled={loading || customers.length === 0}
          onClick={createLink}
          className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]"
        >
          {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <LinkIcon data-icon="inline-start" aria-hidden />}
          產生連結
        </Button>
      </div>

      {generatedUrl && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-extrabold text-emerald-900">客戶連結已產生</p>
              <p className="text-xs font-semibold text-emerald-700">到期時間：{new Date(expiresAt).toLocaleString('zh-TW')}</p>
            </div>
            <Button type="button" variant="outline" onClick={copyLink} className="border-emerald-300 bg-white font-bold text-emerald-800 hover:bg-emerald-100">
              {copied ? <Check data-icon="inline-start" aria-hidden /> : <Copy data-icon="inline-start" aria-hidden />}
              {copied ? '已複製' : '複製'}
            </Button>
          </div>
          <p className="break-all rounded-md bg-white p-3 text-xs font-semibold leading-relaxed text-slate-700">{generatedUrl}</p>
        </div>
      )}

      {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
      {customers.length === 0 && <p className="text-sm font-semibold text-slate-500">尚無客戶可產生連結。</p>}
    </div>
  );
}
