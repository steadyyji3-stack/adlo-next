'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackPricingClick } from '@/lib/gtm';

interface CheckoutButtonProps {
  planId: string;
  billing: 'monthly' | 'yearly';
  label?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function CheckoutButton({
  planId,
  billing,
  label = '立即訂閱',
  className = '',
  variant = 'default',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');
    trackPricingClick(planId, billing);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? '建立結帳頁面失敗');
      }

      /* 導向 Stripe Checkout */
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤，請稍後再試');
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        variant={variant}
        className={`w-full ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            處理中⋯
          </>
        ) : label}
      </Button>
      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
