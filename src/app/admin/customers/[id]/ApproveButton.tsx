'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ApproveButton({ customerId, disabled }: { customerId: string; disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function approve() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/approve`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '通過失敗');
        return;
      }
      router.refresh();
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={approve} disabled={disabled || loading} className="h-11 bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />}
        通過 onboarding
      </Button>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
