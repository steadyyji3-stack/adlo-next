import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Globe2,
  History,
  MessageSquareText,
  Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerOutcomeTimeline } from '@/lib/customer-outcome-timeline-data';
import type { CustomerOutcomeTimelineItem } from '@/lib/customer-outcome-timeline';
import { getCustomerDetail } from '@/lib/customers';

export const dynamic = 'force-dynamic';

const paidStatuses = new Set(['active', 'trialing', 'past_due']);

const toneClasses = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  attention: 'border-amber-200 bg-amber-50 text-amber-700',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default async function CustomerHistoryPage() {
  const customerId = await getCustomerIdFromSession();
  const customer = customerId ? await getCustomerDetail(customerId) : null;
  const canUse = Boolean(customer?.subscriptions.some((subscription) => paidStatuses.has(subscription.status)));
  const timeline = canUse && customerId ? await loadTimeline(customerId) : { items: [], available: true };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="font-bold text-slate-700">
            <Link href="/customer/dashboard"><ArrowLeft aria-hidden />回後台</Link>
          </Button>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#0F6E56]" aria-hidden />
            <span className="hidden text-sm font-semibold text-slate-600 sm:inline">{customer?.store_name ?? 'adlo 客戶工具'}</span>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">付費功能</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="border-b border-slate-200 pb-7">
          <div className="mb-3 flex items-center gap-2 text-[#0F6E56]">
            <History className="h-5 w-5" aria-hidden />
            <span className="text-xs font-extrabold">成果歷史</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">你完成過什麼，網站發生什麼變化</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            依時間整理已完成工作與觀察結果。分數變化只代表前後紀錄，不宣稱由單一動作造成。
          </p>
        </div>

        {!customer ? (
          <Gate title="請先登入客戶後台" body="請使用訂閱 email 的 magic link 登入後查看自己的成果歷史。" href="/customer/login?next=/customer/history" action="前往登入" />
        ) : !canUse ? (
          <Gate title="此功能需要有效訂閱" body="啟用或恢復訂閱後，即可持續累積與比較店家成果。" href="/customer/billing" action="查看訂閱" />
        ) : !timeline.available ? (
          <Gate title="成果紀錄暫時無法載入" body="你的資料沒有遺失，請稍後重新整理。" href="/customer/history" action="重新整理" />
        ) : timeline.items.length === 0 ? (
          <EmptyHistory />
        ) : (
          <HistoryContent items={timeline.items} />
        )}
      </main>
    </div>
  );
}

async function loadTimeline(customerId: string) {
  try {
    return { items: await getCustomerOutcomeTimeline(customerId, 36), available: true };
  } catch {
    return { items: [], available: false };
  }
}

function HistoryContent({ items }: { items: CustomerOutcomeTimelineItem[] }) {
  const counts = items.reduce<Record<CustomerOutcomeTimelineItem['kind'], number>>(
    (result, item) => ({ ...result, [item.kind]: result[item.kind] + 1 }),
    { growth: 0, site_scan: 0, review_draft: 0, report: 0 },
  );

  return (
    <div>
      <section className="grid grid-cols-2 border-b border-slate-200 md:grid-cols-4" aria-label="成果紀錄摘要">
        <SummaryMetric label="完成任務" value={counts.growth} icon={Target} />
        <SummaryMetric label="網站檢查" value={counts.site_scan} icon={Globe2} />
        <SummaryMetric label="評論成品" value={counts.review_draft} icon={MessageSquareText} />
        <SummaryMetric label="成果摘要" value={counts.report} icon={FileText} />
      </section>

      <ol className="mx-auto mt-8 max-w-4xl border-l border-slate-200 pl-5 sm:pl-8">
        {items.map((item) => (
          <li key={item.id} className="relative border-b border-slate-200 py-6 first:pt-1 last:border-b-0">
            <span className="absolute -left-[29px] top-7 grid h-4 w-4 place-items-center rounded-full border-4 border-[#F7F8FA] bg-[#1D9E75] sm:-left-[37px]" aria-hidden />
            <div className="flex flex-wrap items-center gap-2">
              <time className="text-xs font-semibold text-slate-400" dateTime={item.occurredAt}>{formatDate(item.occurredAt)}</time>
              <Badge variant="outline" className={toneClasses[item.tone]}>{item.statusLabel}</Badge>
              {item.metric && <span className="text-xs font-extrabold tabular-nums text-slate-700">{item.metric}</span>}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-slate-950 sm:text-lg">{item.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{item.summary}</p>
              </div>
              {item.href && (
                <Button asChild variant="ghost" size="sm" className="w-fit shrink-0 font-bold text-[#0F6E56]">
                  <Link href={item.href}>查看<ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SummaryMetric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Target }) {
  return (
    <div className="min-w-0 border-r border-t border-slate-200 px-4 py-5 last:border-r-0 md:border-t-0">
      <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Icon className="h-4 w-4 text-[#1D9E75]" aria-hidden />{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-950">{value}<span className="ml-1 text-xs font-semibold text-slate-400">筆</span></p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <section className="py-14 text-center">
      <CheckCircle2 className="mx-auto h-9 w-9 text-[#1D9E75]" aria-hidden />
      <h2 className="mt-4 text-xl font-extrabold text-slate-950">完成第一件工作後，這裡就會開始累積</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">先取得本週完成品，或執行第一次網站檢查。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]"><Link href="/customer/week?generate=1"><Target aria-hidden />取得本週完成品</Link></Button>
        <Button asChild variant="outline" className="font-bold"><Link href="/customer/tools/site-optimizer"><Globe2 aria-hidden />檢查網站</Link></Button>
      </div>
    </section>
  );
}

function Gate({ title, body, href, action }: { title: string; body: string; href: string; action: string }) {
  return (
    <section className="border-y border-amber-200 bg-amber-50 px-4 py-7 sm:px-6">
      <h2 className="text-lg font-extrabold text-amber-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">{body}</p>
      <Button asChild className="mt-5 bg-amber-900 font-bold text-white hover:bg-amber-800"><Link href={href}>{action}</Link></Button>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Taipei',
  }).format(date);
}
