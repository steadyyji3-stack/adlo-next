import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomerIdFromSearchParams } from '@/lib/customer-auth';
import { getCustomerSubscriptionSnapshot } from '@/lib/customer-billing';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  active: '服務中',
  trialing: '試用中',
  paused: '暫停',
  cancelled: '已取消',
  past_due: '付款逾期',
  incomplete: '付款未完成',
  unpaid: '未付款',
};

const statusClasses: Record<string, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  trialing: 'border-blue-200 bg-blue-50 text-blue-700',
  paused: 'border-slate-200 bg-slate-100 text-slate-600',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  past_due: 'border-amber-200 bg-amber-50 text-amber-700',
  incomplete: 'border-amber-200 bg-amber-50 text-amber-700',
  unpaid: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default async function CustomerBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; customer_token?: string }>;
}) {
  const params = await searchParams;
  const customerId = getCustomerIdFromSearchParams(params);
  const snapshot = customerId ? await getCustomerSubscriptionSnapshot(customerId) : null;
  const customerToken = params.customer_token ?? null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">adlo billing</p>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">訂閱管理</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              查看目前訂閱狀態，或前往 Stripe Customer Portal 管理付款方式與取消訂閱。
            </p>
          </div>
          <Link href="/" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            回 adlo
          </Link>
        </div>

        {!customerId ? (
          <Notice title="連結無法驗證" body="請從 adlo 寄給你的客戶後台連結重新開啟訂閱管理頁。" />
        ) : !snapshot ? (
          <Notice title="找不到客戶資料" body="請確認連結是否正確，或聯絡 adlo 協助處理。" />
        ) : (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold text-slate-900">{snapshot.customer.store_name}</CardTitle>
              <CardDescription>{snapshot.customer.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {snapshot.subscription ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoBlock label="方案" value={snapshot.subscription.plan_id} />
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">狀態</p>
                    <Badge variant="outline" className={statusClasses[snapshot.subscription.status]}>
                      {statusLabels[snapshot.subscription.status] ?? snapshot.subscription.status}
                    </Badge>
                  </div>
                  <InfoBlock label="目前週期結束" value={new Date(snapshot.subscription.current_period_end).toLocaleDateString('zh-TW')} />
                </div>
              ) : (
                <Notice title="尚無訂閱紀錄" body="目前沒有可管理的 Stripe 訂閱。" compact />
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                取消會在 Stripe Customer Portal 完成；Stripe webhook 回傳後，adlo 會同步更新訂閱狀態。服務會依 Stripe 訂閱週期維持到目前週期結束。
              </div>

              <CancelSubscriptionButton customerId={snapshot.customer.id} customerToken={customerToken} />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function Notice({ title, body, compact = false }: { title: string; body: string; compact?: boolean }) {
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-800 ${compact ? 'p-4 text-sm' : 'p-5 text-sm leading-relaxed'}`}>
      <p className="font-bold">{title}</p>
      <p className="mt-1">{body}</p>
    </div>
  );
}
