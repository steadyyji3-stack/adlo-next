import Link from 'next/link';
import { ArrowLeft, FlaskConical, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerDetail } from '@/lib/customers';
import { SyntheticConsumerWorkspace } from './SyntheticConsumerWorkspace';

export const dynamic = 'force-dynamic';

const paidStatuses = new Set(['active', 'trialing', 'past_due']);

export default async function SyntheticConsumerPage() {
  const customerId = await getCustomerIdFromSession();
  const customer = customerId ? await getCustomerDetail(customerId) : null;
  const canUse = Boolean(customer?.subscriptions.some((subscription) => paidStatuses.has(subscription.status)));

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="font-bold text-slate-700">
            <Link href="/customer/dashboard"><ArrowLeft aria-hidden />回後台</Link>
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0F6E56]" aria-hidden />
            <span className="hidden text-sm font-semibold text-slate-600 sm:inline">{customer?.store_name ?? 'adlo 客戶工具'}</span>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">付費功能</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 border-b border-slate-200 pb-7">
          <div className="mb-3 flex items-center gap-2 text-[#0F6E56]">
            <FlaskConical className="h-5 w-5" aria-hidden />
            <span className="text-xs font-extrabold uppercase tracking-widest">Synthetic Consumer Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">合成消費者購買意願分析</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            先模擬五位台灣消費者的完整想法，再將文字轉換為購買意願機率與可交付的市場建議。
          </p>
        </div>

        {!customer ? (
          <Gate title="請先登入客戶後台" body="請使用訂閱 email 的 magic link 登入後再開始分析。" href="/customer/login?next=/customer/tools/synthetic-consumer" action="前往登入" />
        ) : !canUse ? (
          <Gate title="此功能需要有效訂閱" body="啟用或恢復訂閱後，每日可產生三份完整分析報告。" href="/customer/billing" action="查看訂閱" />
        ) : (
          <SyntheticConsumerWorkspace />
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
