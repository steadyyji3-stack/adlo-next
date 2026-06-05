import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listCustomers } from '@/lib/customers';
import { CustomerLinkForm } from './CustomerLinkForm';

export const dynamic = 'force-dynamic';

export default async function AdminCustomerLinksPage() {
  const customers = await listCustomers();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B Security</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">客戶連結</h1>
            <p className="mt-1 text-sm text-slate-500">產生有期限的簽章連結，用於客戶 Dashboard、訂閱管理與 onboarding。</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
              客戶管理
            </Link>
            <Link href="/admin" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
              回後台首頁
            </Link>
          </div>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900">產生 signed customer URL</CardTitle>
            <CardDescription>
              連結內只放 HMAC 簽章 token；audit log 只記目的頁與到期時間，不記完整 URL。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerLinkForm customers={customers} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
