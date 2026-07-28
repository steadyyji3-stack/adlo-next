import Link from 'next/link';
import {
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  Repeat2,
  Sparkles,
  Store,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCoreSubscriptionMetrics, type CoreFunnelStep } from '@/lib/core-subscription-metrics';

export const dynamic = 'force-dynamic';

const funnelIcons = {
  subscribed: Store,
  profiled: ClipboardCheck,
  activated: Sparkles,
  completed: CheckCircle2,
  feedback: MessageSquareText,
  week_two: Repeat2,
};

const statusLabels = {
  active: '付費中',
  trialing: '試用中',
};

const stageClasses = {
  subscribed: 'border-slate-200 bg-slate-50 text-slate-600',
  profiled: 'border-sky-200 bg-sky-50 text-sky-700',
  activated: 'border-violet-200 bg-violet-50 text-violet-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  feedback: 'border-amber-200 bg-amber-50 text-amber-700',
  week_two: 'border-teal-200 bg-teal-50 text-teal-700',
};

export default async function AdminCoreMetricsPage() {
  const metrics = await getCoreSubscriptionMetrics();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">核心訂閱漏斗</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              只看目前付費中或試用中的客戶，確認產品是否讓客戶自助取得價值並在下一週回來。
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/admin/customers" className="text-[#0F6E56] underline-offset-4 hover:underline">
              客戶管理
            </Link>
            <span className="font-normal text-slate-400">
              更新 {formatDateTime(metrics.generatedAt)}
            </span>
          </div>
        </header>

        <section aria-labelledby="funnel-heading" className="mb-10 overflow-hidden border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="funnel-heading" className="text-base font-extrabold text-slate-900">目前核心行為</h2>
              <p className="text-sm text-slate-500">有效訂閱母體：{metrics.paidCustomers} 家</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-6">
            {metrics.funnel.map((step) => <FunnelStep key={step.id} step={step} />)}
          </div>
        </section>

        <section aria-labelledby="customers-heading" className="overflow-hidden border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 id="customers-heading" className="text-base font-extrabold text-slate-900">客戶啟用進度</h2>
            <p className="mt-1 text-sm text-slate-500">依最近產品活動排序，用來快速找出卡在 onboarding 或第一週的客戶。</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>店家</TableHead>
                  <TableHead>訂閱</TableHead>
                  <TableHead>目前階段</TableHead>
                  <TableHead className="text-right">取得週數</TableHead>
                  <TableHead className="text-right">完成週數</TableHead>
                  <TableHead>最近活動</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      尚無付費中或試用中的客戶
                    </TableCell>
                  </TableRow>
                ) : metrics.customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-bold text-slate-900">{customer.storeName}</div>
                      <div className="text-xs text-slate-500">{customer.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={customer.subscriptionStatus === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-sky-200 bg-sky-50 text-sky-700'}>
                        {statusLabels[customer.subscriptionStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={stageClasses[customer.stage]}>
                        {customer.stageLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-slate-700">{customer.generatedWeeks}</TableCell>
                    <TableCell className="text-right tabular-nums text-slate-700">{customer.completedWeeks}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-500">
                      {formatDate(customer.lastActivityAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/customers/${customer.id}`} className="text-sm font-bold text-[#0F6E56] underline-offset-4 hover:underline">
                        查看
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </main>
  );
}

function FunnelStep({ step }: { step: CoreFunnelStep }) {
  const Icon = funnelIcons[step.id];

  return (
    <article className="min-w-0 bg-white p-5 sm:p-6">
      <div className="mb-5 flex size-9 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600">
        <Icon aria-hidden="true" className="size-4" />
      </div>
      <p className="text-sm font-bold text-slate-800">{step.label}</p>
      <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-950">{step.count}</p>
      <p className="mt-1 text-xs font-bold text-[#0F6E56]">
        {step.rate === null ? step.rateLabel : `${step.rate}% ${step.rateLabel}`}
      </p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{step.description}</p>
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Taipei',
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei',
  });
}
