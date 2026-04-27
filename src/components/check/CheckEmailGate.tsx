'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ShieldCheck, Ban, XCircle } from 'lucide-react';
import { trackCheckEmailUnlock } from '@/lib/gtm';

interface Props {
  open: boolean;
  onUnlock: () => void;
  onClose: () => void;
}

export default function CheckEmailGate({ open, onUnlock, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('請輸入有效的 email 地址');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/check/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '解鎖失敗，請稍後再試');
        setLoading(false);
        return;
      }
      trackCheckEmailUnlock();
      onUnlock();
    } catch {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto size-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <Mail className="size-6 text-[#1D9E75]" aria-hidden />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-900">
            再查下去之前，留個 email 吧
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 leading-relaxed pt-2">
            你已經查了 3 次。留下 email，我們會記住你，
            下次查詢直接給你更深的分析。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="h-11"
              aria-label="電子郵件地址"
              required
            />
            {error && <p role="alert" className="text-sm text-rose-600 mt-2">{error}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold focus-visible:ring-emerald-500"
          >
            {loading ? '解鎖中⋯' : '解鎖 10 次查詢'}
          </Button>
        </form>

        <ul className="mt-4 space-y-2 text-xs text-slate-500">
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" aria-hidden />
            只用於健檢優化通知
          </li>
          <li className="flex items-center gap-2">
            <XCircle className="size-3.5 text-emerald-600 shrink-0" aria-hidden />
            隨時一鍵退訂
          </li>
          <li className="flex items-center gap-2">
            <Ban className="size-3.5 text-emerald-600 shrink-0" aria-hidden />
            不會賣給第三方
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
