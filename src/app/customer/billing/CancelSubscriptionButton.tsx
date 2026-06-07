'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CancelSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function openPortal() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/me/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.url) {
        setError(data.error?.message ?? '目前無法開啟取消入口');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('目前無法開啟取消入口');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button type="button" onClick={openPortal} disabled={loading} variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
        {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <ExternalLink data-icon="inline-start" aria-hidden />}
        前往 Stripe 管理 / 取消訂閱
      </Button>
      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
