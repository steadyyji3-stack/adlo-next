import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CustomerLoginCheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">adlo customer</p>
          <CardTitle className="text-2xl font-extrabold text-slate-900">請查看信箱</CardTitle>
          <CardDescription>登入連結已寄出。連結為單次使用，短時間內有效。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="font-bold">
            <Link href="/customer/login">重新輸入 email</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
