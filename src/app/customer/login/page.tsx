import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">adlo customer</p>
          <CardTitle className="text-2xl font-extrabold text-slate-900">登入客戶後台</CardTitle>
          <CardDescription>輸入訂閱 email，我們會寄出一次性登入連結，不需要密碼。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm defaultEmail={params.email ?? ''} nextPath={nextPath} />
          <Link href="/" className="block text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            回 adlo 首頁
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function normalizeNextPath(value?: string) {
  if (!value?.startsWith('/')) return '/customer/dashboard';
  if (value.startsWith('//')) return '/customer/dashboard';
  return value;
}
