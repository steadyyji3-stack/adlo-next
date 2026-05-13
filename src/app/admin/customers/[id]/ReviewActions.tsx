'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Decision = 'approved' | 'needs_revision' | 'rejected';

const decisionCopy: Record<Decision, string> = {
  approved: '通過 onboarding',
  needs_revision: '請客戶補件',
  rejected: '拒絕',
};

export function ReviewActions({ customerId, disabled }: { customerId: string; disabled: boolean }) {
  const router = useRouter();
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function submitReview(decision: Decision) {
    setPendingDecision(decision);
    setError('');
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/review`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision, note: note.trim() || undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error?.message ?? '更新 review 失敗');
        return;
      }
      setNote('');
      router.refresh();
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setPendingDecision(null);
    }
  }

  const isPending = pendingDecision !== null;

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Review note（選填，只記錄是否有填寫，不進 audit payload）"
        disabled={disabled || isPending}
        maxLength={500}
        className="min-h-20 resize-none text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => submitReview('approved')}
          disabled={disabled || isPending}
          className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]"
        >
          {pendingDecision === 'approved' ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 data-icon="inline-start" aria-hidden />
          )}
          {decisionCopy.approved}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => submitReview('needs_revision')}
          disabled={disabled || isPending}
          className="font-bold"
        >
          {pendingDecision === 'needs_revision' ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <RotateCcw data-icon="inline-start" aria-hidden />
          )}
          {decisionCopy.needs_revision}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => submitReview('rejected')}
          disabled={disabled || isPending}
          className="font-bold"
        >
          {pendingDecision === 'rejected' ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <XCircle data-icon="inline-start" aria-hidden />
          )}
          {decisionCopy.rejected}
        </Button>
      </div>
      {disabled && <p className="text-sm text-slate-500">只有待 review 的客戶可以執行 onboarding review。</p>}
      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
