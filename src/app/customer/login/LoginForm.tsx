'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm({ defaultEmail, nextPath }: { defaultEmail: string; nextPath: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await signIn('resend', {
      email,
      redirect: false,
      redirectTo: nextPath,
    });

    if (!response?.ok) {
      setError('目前無法寄出登入連結，請確認信箱是否與訂閱資料一致。');
      setLoading(false);
      return;
    }

    window.location.href = '/customer/login/check-email';
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="owner@example.com"
        required
        autoComplete="email"
      />
      {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
        {loading ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden /> : <Mail data-icon="inline-start" aria-hidden />}
        寄送登入連結
      </Button>
    </form>
  );
}
