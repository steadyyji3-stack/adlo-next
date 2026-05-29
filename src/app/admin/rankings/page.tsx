import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listCustomers } from '@/lib/customers';
import { listAdminKeywordRankings, summarizeLatestRankings } from '@/lib/keyword-rankings';
import { RankingEntryForm } from './RankingEntryForm';

export const dynamic = 'force-dynamic';

export default async function AdminRankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; keyword?: string }>;
}) {
  const filters = await searchParams;
  const [customers, rankings] = await Promise.all([
    listCustomers(),
    listAdminKeywordRankings({ customerId: filters.customer_id, keyword: filters.keyword }),
  ]);
  const summary = summarizeLatestRankings(rankings);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B4</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">Local SEO 排名追蹤</h1>
            <p className="mt-1 text-sm text-slate-500">客戶關鍵字排名歷史與手動錄入。SERP provider 與 cron 會在後續 PR 接上。</p>
          </div>
          <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            客戶管理
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="追蹤字組" value={summary.trackedKeywords} />
          <StatCard label="Top 3" value={summary.top3} />
          <StatCard label="Top 10" value={summary.top10} />
          <StatCard label="平均排名" value={summary.averageRank ?? '-'} />
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900">新增排名紀錄</CardTitle>
            <CardDescription>先支援手動錄入與資料檢視；自動抓取會獨立接 SERP API。</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">尚無客戶資料，請先完成 customer foundation。</p>
            ) : (
              <RankingEntryForm customers={customers} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>關鍵字</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>排名</TableHead>
                <TableHead>來源</TableHead>
                <TableHead className="text-right">檢查時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    尚無排名資料
                  </TableCell>
                </TableRow>
              ) : (
                rankings.map((ranking) => (
                  <TableRow key={ranking.id} className="hover:bg-emerald-50/20">
                    <TableCell>
                      <div className="font-bold text-slate-900">{ranking.keyword}</div>
                      <div className="text-xs text-slate-500">
                        搜尋量 {ranking.search_volume ?? '-'} · CPC {ranking.cpc_ntd ?? '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{ranking.customer?.store_name ?? '-'}</div>
                      <div className="text-xs text-slate-500">{ranking.customer?.email ?? ''}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={rankBadgeClass(ranking.rank_position)}>
                        {ranking.rank_position ? `#${ranking.rank_position}` : '100+'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{ranking.source}</TableCell>
                    <TableCell className="text-right text-sm text-slate-500">
                      {new Date(ranking.checked_at).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
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

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function rankBadgeClass(rank: number | null) {
  if (rank !== null && rank <= 3) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (rank !== null && rank <= 10) return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-slate-200 bg-slate-100 text-slate-600';
}
