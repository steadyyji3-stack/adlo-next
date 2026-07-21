import Link from 'next/link';
import { ArrowLeft, Globe2, LockKeyhole } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerStoreProfile } from '@/lib/customer-store-profile';
import { getCustomerDetail } from '@/lib/customers';
import { classifySiteIndustry } from '@/lib/customer-site-optimizer';
import { SiteOptimizer } from './SiteOptimizer';

export const dynamic = 'force-dynamic';

const paidStatuses = new Set(['active', 'trialing', 'past_due']);

export default async function CustomerSiteOptimizerPage() {
  const customerId = await getCustomerIdFromSession();
  const [customer, profile] = customerId
    ? await Promise.all([getCustomerDetail(customerId), getCustomerStoreProfile(customerId)])
    : [null, null];

  const canUse = Boolean(customer?.subscriptions.some((subscription) => paidStatuses.has(subscription.status)));
  const industryMode = classifySiteIndustry(profile?.industry || customer?.industry);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="font-bold text-slate-700">
            <Link href="/customer/dashboard"><ArrowLeft aria-hidden />回後台</Link>
          </Button>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-[#0F6E56]" aria-hidden />
            <span className="hidden text-sm font-semibold text-slate-600 sm:inline">{customer?.store_name ?? 'adlo 客戶工具'}</span>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">付費功能</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 border-b border-slate-200 pb-7">
          <div className="mb-3 flex items-center gap-2 text-[#0F6E56]">
            <Globe2 className="h-5 w-5" aria-hidden />
            <span className="text-xs font-extrabold uppercase tracking-widest">Site Optimizer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">一鍵全站優化</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            檢查店家網站的代表頁面，整理優先修正項目、頁面文案骨架與可貼上的店家結構化資料。
          </p>
        </div>

        {!customer || !profile ? (
          <Gate title="請先完成店家檔案" body="店名、產業與網站資料齊全後，才能產生不虛構資訊的優化包。" href="/onboarding" action="前往 onboarding" />
        ) : !canUse ? (
          <Gate title="此功能需要有效訂閱" body="啟用或恢復訂閱後，即可掃描已登記的店家網站。" href="/customer/billing" action="查看訂閱" />
        ) : !customer.website_url ? (
          <Gate title="尚未登記店家網站" body="請先在 onboarding 填寫網站網址；掃描器只會讀取這個網域。" href="/onboarding" action="補上網站" />
        ) : (
          <SiteOptimizer
            initialUrl={customer.website_url}
            storeName={profile.storeName}
            industryMode={industryMode}
          />
        )}
      </main>
    </div>
  );
}

function Gate({ title, body, href, action }: { title: string; body: string; href: string; action: string }) {
  return (
    <section className="border-y border-amber-200 bg-amber-50 px-4 py-7 sm:px-6">
      <h2 className="text-lg font-extrabold text-amber-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">{body}</p>
      <Button asChild className="mt-5 bg-amber-900 font-bold text-white hover:bg-amber-800">
        <Link href={href}>{action}</Link>
      </Button>
    </section>
  );
}
