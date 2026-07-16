import Link from 'next/link';
import { CalendarDays, FileText, MessageSquareText, Newspaper, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerDashboardData, type GbpPost, type GbpReview, type KeywordRanking, type MonthlyReport } from '@/lib/customer-dashboard';

export const dynamic = 'force-dynamic';

const serviceStatusLabels: Record<string, string> = {
  pending_onboarding: '待填表',
  pending_review: '待審核',
  active: '服務中',
  paused: '暫停',
  cancelled: '已取消',
  churned: '已流失',
};

const postStatusLabels: Record<string, string> = {
  draft: '草稿',
  scheduled: '已排程',
  posted: '已發布',
  failed: '失敗',
};

const statusClasses: Record<string, string> = {
  pending_onboarding: 'border-slate-200 bg-slate-100 text-slate-600',
  pending_review: 'border-amber-200 bg-amber-50 text-amber-700',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  paused: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  churned: 'border-slate-200 bg-slate-100 text-slate-500',
  draft: 'border-slate-200 bg-slate-100 text-slate-600',
  scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
  posted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  drafted: 'border-blue-200 bg-blue-50 text-blue-700',
};

export default async function CustomerDashboardPage() {
  const customerId = await getCustomerIdFromSession();

  if (!customerId) {
    return <CustomerGate />;
  }

  const dashboard = await getCustomerDashboardData(customerId);
  if (!dashboard) {
    return <CustomerGate title="找不到客戶資料" body="你的登入 session 沒有對應到 adlo 客戶。請確認使用訂閱 email 登入。" />;
  }

  const { customer, latestSubscription, posts, reviews, rankings, reports, kpis } = dashboard;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/customer/dashboard" className="text-xl font-extrabold tracking-tight text-slate-950">
            adlo
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={statusClasses[customer.service_status]}>
              {serviceStatusLabels[customer.service_status] ?? customer.service_status}
            </Badge>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{customer.store_name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Customer Dashboard</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              {customer.store_name} <span className="text-[#1D9E75]">{formatMonth(new Date())}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              本頁先彙整已入庫的貼文、評論、排名與月報資料；GBP 洞察 API 串接後會補上曝光、點擊與互動指標。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
              <Link href="/customer/tools/content-studio">
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                內容工作台
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-bold">
              <Link href="/onboarding">更新店家檔案</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard icon={Newspaper} label="本月 GBP 貼文" value={`${kpis.postedThisMonth}/${kpis.postsThisMonth}`} helper="已發布 / 已排程" />
          <KpiCard icon={Star} label="新評論" value={String(kpis.newReviewsThisMonth)} helper={kpis.averageRating ? `平均 ${kpis.averageRating.toFixed(1)} 星` : '尚無本月評論'} />
          <KpiCard icon={TrendingUp} label="關鍵字平均排名" value={kpis.averageRank ? `#${kpis.averageRank.toFixed(1)}` : '-'} helper="最近一次追蹤" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <PostsCard posts={posts} />
            <RankingsCard rankings={rankings} />
          </div>
          <aside className="flex flex-col gap-6">
            <SubscriptionCard plan={latestSubscription?.plan_id ?? '-'} status={latestSubscription?.status ?? '-'} periodEnd={latestSubscription?.current_period_end ?? null} />
            <ReviewsCard reviews={reviews} unansweredCount={kpis.unansweredReviews} />
            <ReportsCard reports={reports} />
          </aside>
        </div>
      </main>
    </div>
  );
}

function CustomerGate({ title = '請先登入客戶後台', body = '請使用 adlo 寄出的 email magic link 登入。' }: { title?: string; body?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <Card className="w-full max-w-lg border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-slate-900">{title}</CardTitle>
          <CardDescription>{body}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="font-bold">
            <Link href="/">回 adlo 首頁</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function KpiCard({ icon: Icon, label, value, helper }: { icon: typeof Newspaper; label: string; value: string; helper: string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{label}</CardTitle>
        <Icon className="h-5 w-5 text-[#1D9E75]" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function PostsCard({ posts }: { posts: GbpPost[] }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold text-slate-900">近期 GBP 貼文</CardTitle>
        <CardDescription>已排程、草稿與發布紀錄。</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <EmptyState text="尚無貼文資料，GBP 自動化 PR 完成後會開始累積。" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>標題</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">排程</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-[260px] truncate font-semibold text-slate-900">{post.title}</TableCell>
                  <TableCell className="text-slate-600">{post.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClasses[post.status]}>
                      {postStatusLabels[post.status] ?? post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">{formatDate(post.scheduled_for)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RankingsCard({ rankings }: { rankings: KeywordRanking[] }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold text-slate-900">Local SEO 排名</CardTitle>
        <CardDescription>最近一次關鍵字排名追蹤。</CardDescription>
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <EmptyState text="尚無排名資料，Local SEO tracking PR 完成後會顯示趨勢。" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>關鍵字</TableHead>
                <TableHead>排名</TableHead>
                <TableHead className="text-right">檢查時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.slice(0, 8).map((ranking) => (
                <TableRow key={ranking.id}>
                  <TableCell className="font-semibold text-slate-900">{ranking.keyword}</TableCell>
                  <TableCell className="tabular-nums text-slate-700">{ranking.rank_position ? `#${ranking.rank_position}` : '100+'}</TableCell>
                  <TableCell className="text-right text-sm text-slate-500">{formatDate(ranking.checked_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionCard({ plan, status, periodEnd }: { plan: string; status: string; periodEnd: string | null }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <CalendarDays className="h-5 w-5 text-[#1D9E75]" aria-hidden />
          訂閱
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <InfoRow label="方案" value={plan} />
        <InfoRow label="狀態" value={status} />
        <InfoRow label="週期結束" value={periodEnd ? formatDate(periodEnd) : '-'} />
      </CardContent>
    </Card>
  );
}

function ReviewsCard({ reviews, unansweredCount }: { reviews: GbpReview[]; unansweredCount: number }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <MessageSquareText className="h-5 w-5 text-[#1D9E75]" aria-hidden />
          評論
        </CardTitle>
        <CardDescription>{unansweredCount} 則待回覆。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reviews.length === 0 ? (
          <EmptyState text="尚無評論資料。" />
        ) : (
          reviews.slice(0, 4).map((review) => (
            <div key={review.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{review.reviewer_name ?? 'Google 使用者'}</span>
                <Badge variant="outline" className={statusClasses[review.reply_status ?? 'pending']}>
                  {review.reply_status ?? 'pending'}
                </Badge>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{review.comment ?? '無文字評論'}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ReportsCard({ reports }: { reports: MonthlyReport[] }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <FileText className="h-5 w-5 text-[#1D9E75]" aria-hidden />
          月報
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reports.length === 0 ? (
          <EmptyState text="尚無月報，月報產生工具會在後續 PR 補上。" />
        ) : (
          reports.map((report) => (
            <a key={report.id} href={report.pdf_url} className="rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/40">
              {formatMonth(new Date(report.period_start))}
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-500">{text}</p>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
}

function formatMonth(value: Date) {
  return value.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
}
