'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CustomerInstantDeliverable } from '@/lib/customer-instant-value';

export function InstantValuePanel({
  deliverable,
  isWeeklyDeliverable,
}: {
  deliverable: CustomerInstantDeliverable;
  isWeeklyDeliverable: boolean;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copyDeliverable() {
    try {
      await navigator.clipboard.writeText(deliverable.content);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('error');
    }
  }

  return (
    <section className="border-y border-emerald-200 bg-emerald-50/60 px-5 py-6 sm:px-6" aria-labelledby="instant-value-title">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,.85fr)] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#0F6E56]">
            <Sparkles className="h-4 w-4" aria-hidden />
            <p className="text-xs font-extrabold">{isWeeklyDeliverable ? '本週已替你準備' : deliverable.label}</p>
          </div>
          <h2 id="instant-value-title" className="mt-2 text-xl font-extrabold text-slate-950">{deliverable.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{deliverable.usage}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={copyDeliverable} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
              {copyState === 'copied' ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copyState === 'copied' ? '已複製，可以使用' : '複製完成品'}
            </Button>
            <Button asChild variant="outline" className="border-emerald-200 bg-white font-bold">
              <Link href={isWeeklyDeliverable ? '/customer/week' : '/customer/week?generate=1'}>
                <Target className="h-4 w-4" aria-hidden />
                {isWeeklyDeliverable ? '查看完整任務' : '再準備本週任務'}
              </Link>
            </Button>
          </div>
          {copyState === 'error' && <p className="mt-3 text-sm font-semibold text-rose-700" role="alert">無法使用剪貼簿，請手動選取右側內容。</p>}
        </div>
        <div className="min-w-0 border-t border-emerald-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{deliverable.content}</p>
        </div>
      </div>
    </section>
  );
}
