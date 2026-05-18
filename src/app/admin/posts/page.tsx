import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listCustomers } from '@/lib/customers';
import { listAdminGbpPosts } from '@/lib/gbp-posts';
import { PostDraftForm } from './PostDraftForm';
import { PostStatusSelect } from './PostStatusSelect';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  draft: '草稿',
  scheduled: '已排程',
  posted: '已發布',
  failed: '失敗',
};

const statusClasses: Record<string, string> = {
  draft: 'border-slate-200 bg-slate-100 text-slate-600',
  scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
  posted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const [customers, posts] = await Promise.all([
    listCustomers(),
    listAdminGbpPosts({ customerId: filters.customer_id, status: filters.status }),
  ]);

  const stats = {
    total: posts.length,
    drafts: posts.filter((post) => post.status === 'draft').length,
    scheduled: posts.filter((post) => post.status === 'scheduled').length,
    posted: posts.filter((post) => post.status === 'posted').length,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B3</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">GBP 文案庫</h1>
            <p className="mt-1 text-sm text-slate-500">客戶 Google 商家貼文草稿、排程與發布狀態。此頁不會直接呼叫 Google API。</p>
          </div>
          <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            客戶管理
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="總貼文" value={stats.total} />
          <StatCard label="草稿" value={stats.drafts} />
          <StatCard label="已排程" value={stats.scheduled} />
          <StatCard label="已發布" value={stats.posted} />
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900">新增文案</CardTitle>
            <CardDescription>建立本地文案庫草稿；自動發布與 GBP API 串接會在後續 PR 補上。</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">尚無客戶資料，請先完成 Stripe / onboarding foundation。</p>
            ) : (
              <PostDraftForm customers={customers} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>文案</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">排程</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    尚無 GBP 貼文資料
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-emerald-50/20">
                    <TableCell className="max-w-[380px]">
                      <div className="font-bold text-slate-900">{post.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{post.content}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{post.customer?.store_name ?? '-'}</div>
                      <div className="text-xs text-slate-500">{post.customer?.email ?? ''}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        {post.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Badge variant="outline" className={statusClasses[post.status]}>
                          {statusLabels[post.status]}
                        </Badge>
                        <PostStatusSelect postId={post.id} status={post.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-slate-500">
                      {new Date(post.scheduled_for).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                  </TableRow>
                ))
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
