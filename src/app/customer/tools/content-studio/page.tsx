import Link from 'next/link';
import { ArrowLeft, CreditCard, FileText, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { listCustomerContentBundles } from '@/lib/customer-content-bundles';
import { getCustomerStoreProfile } from '@/lib/customer-store-profile';
import { getCustomerDetail } from '@/lib/customers';
import { ContentStudio } from './ContentStudio';

export const dynamic = 'force-dynamic';

export default async function ContentStudioPage() {
  const customerId = await getCustomerIdFromSession();
  if (!customerId) {
    return <WorkspaceGate icon={Store} title="請先登入客戶後台" href="/customer/login" action="使用 email 登入" />;
  }

  const [customer, profile, bundles] = await Promise.all([
    getCustomerDetail(customerId),
    getCustomerStoreProfile(customerId),
    listCustomerContentBundles(customerId),
  ]);
  if (!customer) {
    return <WorkspaceGate icon={Store} title="找不到客戶資料" href="/customer/login" action="重新登入" />;
  }

  const activeSubscription = customer.subscriptions.find(
    (subscription) => subscription.status === 'active' || subscription.status === 'trialing',
  );
  if (!activeSubscription) {
    return <WorkspaceGate icon={CreditCard} title="需要有效訂閱" href="/customer/billing" action="查看訂閱狀態" />;
  }
  if (!profile) {
    return <WorkspaceGate icon={FileText} title="請先建立店家檔案" href="/onboarding" action="建立店家檔案" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="ghost" size="icon" title="回客戶後台">
              <Link href="/customer/dashboard" aria-label="回客戶後台">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-950">{customer.store_name}</p>
              <p className="text-xs text-slate-500">每週內容工作台</p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {activeSubscription.status === 'trialing' ? '免費試用中' : '訂閱中'}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <ContentStudio initialBundles={bundles} storeName={profile.storeName} />
      </main>
    </div>
  );
}

function WorkspaceGate({
  icon: Icon,
  title,
  href,
  action,
}: {
  icon: typeof Store;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md border-y border-slate-200 py-10 text-center">
        <Icon className="mx-auto h-8 w-8 text-[#1D9E75]" aria-hidden />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">{title}</h1>
        <Button asChild className="mt-6 bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          <Link href={href}>{action}</Link>
        </Button>
      </div>
    </main>
  );
}
