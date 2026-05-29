import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, Star, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { buildMonthlyReportPreview, type MonthlyReportPreview } from '@/lib/monthly-report';

export const dynamic = 'force-dynamic';

export default async function AdminMonthlyReportPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { customerId } = await params;
  const { period } = await searchParams;
  const report = await buildMonthlyReportPreview(customerId, period);
  if (!report) notFound();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link href={`/admin/customers/${report.customer.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            回客戶詳情
          </Link>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            HTML preview · PDF engine ready
          </Badge>
        </div>

        <ReportPage className="overflow-hidden p-0">
          <section className="bg-gradient-to-br from-[#0F6E56] via-[#1D9E75] to-[#8BE0C2] p-10 text-white">
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-white/80">adlo monthly report</p>
            <h1 className="mt-8 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
              {report.customer.store_name} 月報
            </h1>
            <p className="mt-4 text-2xl font-bold text-white/90">{report.period.label}</p>
            <p className="mt-10 max-w-xl text-base leading-8 text-white/85">來自 adlo 的當月成效彙整。這份預覽以已入庫資料產生，後續 PDF/寄信流程會沿用同一份資料結構。</p>
          </section>
        </ReportPage>

        <ReportPage>
          <ReportHeader title="三個關鍵指標" subtitle="Performance summary" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard icon={FileText} label="GBP 貼文" value={String(report.metrics.gbpPostsPublished)} helper={`${report.metrics.gbpPostsScheduled} 則已排程`} />
            <MetricCard icon={Star} label="新評論" value={String(report.metrics.reviewsNew)} helper={report.metrics.averageRating ? `平均 ${report.metrics.averageRating.toFixed(1)} 星` : '尚無星等'} />
            <MetricCard icon={TrendingUp} label="平均排名" value={report.metrics.averageRank ? `#${report.metrics.averageRank.toFixed(1)}` : '-'} helper={rankDeltaCopy(report.metrics.rankDelta)} />
          </div>
          <Separator className="my-8" />
          <RankingsTable report={report} />
        </ReportPage>

        <ReportPage>
          <ReportHeader title="本月完成" subtitle="Delivery log" />
          <Checklist items={report.completedItems} />
          <Separator className="my-8" />
          <RecentPosts report={report} />
        </ReportPage>

        <ReportPage>
          <ReportHeader title="下月重點" subtitle="Next actions" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section>
              <h3 className="mb-4 text-base font-extrabold text-slate-900">adlo 下月執行</h3>
              <Checklist items={report.nextActions} />
            </section>
            <section>
              <h3 className="mb-4 text-base font-extrabold text-slate-900">需要客戶配合</h3>
              <Checklist items={report.customerRequests} />
            </section>
          </div>
          <Separator className="my-8" />
          <ReviewsSummary report={report} />
        </ReportPage>
      </div>
    </main>
  );
}

function ReportPage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`min-h-[980px] border-slate-200 bg-white shadow-sm print:min-h-screen print:break-after-page print:border-0 print:shadow-none ${className}`}>
      {children}
    </Card>
  );
}

function ReportHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <CardHeader className="border-b border-slate-100">
      <CardDescription className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#0F6E56]">{subtitle}</CardDescription>
      <CardTitle className="text-3xl font-extrabold text-slate-900">{title}</CardTitle>
    </CardHeader>
  );
}

function MetricCard({ icon: Icon, label, value, helper }: { icon: typeof FileText; label: string; value: string; helper: string }) {
  return (
    <CardContent className="p-0">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{label}</p>
          <Icon className="h-5 w-5 text-[#1D9E75]" aria-hidden />
        </div>
        <p className="text-4xl font-extrabold tabular-nums text-slate-900">{value}</p>
        <p className="mt-2 text-sm font-semibold text-slate-500">{helper}</p>
      </div>
    </CardContent>
  );
}

function RankingsTable({ report }: { report: MonthlyReportPreview }) {
  return (
    <section className="px-6">
      <h3 className="mb-4 text-base font-extrabold text-slate-900">關鍵字排名 snapshot</h3>
      {report.latestRankings.length === 0 ? (
        <EmptyText text="本月尚無排名資料。" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {report.latestRankings.map((ranking) => (
            <div key={ranking.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <span className="font-semibold text-slate-800">{ranking.keyword}</span>
              <span className="font-extrabold tabular-nums text-[#0F6E56]">{ranking.rank_position ? `#${ranking.rank_position}` : '100+'}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentPosts({ report }: { report: MonthlyReportPreview }) {
  return (
    <section className="px-6 pb-6">
      <h3 className="mb-4 text-base font-extrabold text-slate-900">近期 GBP 貼文</h3>
      {report.recentPosts.length === 0 ? (
        <EmptyText text="本月尚無 GBP 貼文資料。" />
      ) : (
        <div className="flex flex-col gap-3">
          {report.recentPosts.map((post) => (
            <div key={post.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-extrabold text-slate-900">{post.title}</h4>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{post.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">{post.category} · {formatDate(post.posted_at ?? post.scheduled_for)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewsSummary({ report }: { report: MonthlyReportPreview }) {
  return (
    <section>
      <h3 className="mb-4 text-base font-extrabold text-slate-900">評論摘要</h3>
      {report.recentReviews.length === 0 ? (
        <EmptyText text="本月尚無新評論。" />
      ) : (
        <div className="flex flex-col gap-3">
          {report.recentReviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-bold text-slate-900">{review.reviewer_name ?? 'Google 使用者'}</span>
                <span className="font-extrabold text-[#0F6E56]">{review.rating} 星</span>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{review.comment ?? '無文字評論'}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1D9E75]" aria-hidden />
          <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">{text}</p>;
}

function rankDeltaCopy(delta: number | null) {
  if (delta === null) return '尚無上月比較';
  if (delta > 0) return `較上月進步 ${delta.toFixed(1)} 名`;
  if (delta < 0) return `較上月退步 ${Math.abs(delta).toFixed(1)} 名`;
  return '與上月持平';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
}
