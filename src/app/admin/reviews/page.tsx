import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listAdminGbpReviews } from '@/lib/gbp-reviews';
import { ReviewReplyEditor } from './ReviewReplyEditor';

export const dynamic = 'force-dynamic';

const replyStatusLabels: Record<string, string> = {
  pending: '待回覆',
  drafted: '已草稿',
  posted: '已發布',
};

const statusClasses: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  drafted: 'border-blue-200 bg-blue-50 text-blue-700',
  posted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; reply_status?: string; unanswered?: string }>;
}) {
  const filters = await searchParams;
  const reviews = await listAdminGbpReviews({
    customerId: filters.customer_id,
    replyStatus: filters.reply_status,
    unanswered: filters.unanswered === 'true',
  });
  const stats = {
    total: reviews.length,
    pending: reviews.filter((review) => !review.reply_status || review.reply_status === 'pending').length,
    drafted: reviews.filter((review) => review.reply_status === 'drafted').length,
    posted: reviews.filter((review) => review.reply_status === 'posted').length,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B3</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">GBP 評論回覆</h1>
            <p className="mt-1 text-sm text-slate-500">查看已抓取評論、撰寫回覆草稿、追蹤回覆狀態。此頁不會直接推送到 Google。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/reviews?unanswered=true" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
              只看待回覆
            </Link>
            <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
              客戶管理
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="總評論" value={stats.total} />
          <StatCard label="待回覆" value={stats.pending} />
          <StatCard label="已草稿" value={stats.drafted} />
          <StatCard label="已發布" value={stats.posted} />
        </div>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>評論</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>回覆草稿</TableHead>
                <TableHead className="text-right">日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    尚無 GBP 評論資料
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => {
                  const status = review.reply_status ?? 'pending';
                  return (
                    <TableRow key={review.id} className="hover:bg-emerald-50/20">
                      <TableCell className="max-w-[340px]">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-bold text-slate-900">{review.reviewer_name ?? 'Google 使用者'}</span>
                          <span className="text-sm font-extrabold text-[#0F6E56]">{review.rating} 星</span>
                        </div>
                        <p className="line-clamp-4 text-sm leading-6 text-slate-600">{review.comment ?? '無文字評論'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800">{review.customer?.store_name ?? '-'}</div>
                        <div className="text-xs text-slate-500">{review.customer?.email ?? ''}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClasses[status]}>
                          {replyStatusLabels[status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ReviewReplyEditor reviewId={review.id} initialReply={review.reply_text} initialStatus={review.reply_status} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {review.posted_at ? new Date(review.posted_at).toLocaleDateString('zh-TW') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
