import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listCustomers } from '@/lib/customers';
import { listAdminGbpInsights, summarizeGbpInsights } from '@/lib/gbp-insights';
import { GbpInsightForm } from './GbpInsightForm';

export const dynamic = 'force-dynamic';

export default async function AdminGbpInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>;
}) {
  const filters = await searchParams;
  const [customers, insights] = await Promise.all([
    listCustomers(),
    listAdminGbpInsights({ customerId: filters.customer_id }),
  ]);
  const summary = summarizeGbpInsights(insights);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B3</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">GBP 洞察</h1>
            <p className="mt-1 text-sm text-slate-500">手動或匯入客戶 GBP 每日成效，供 dashboard 與月報彙整使用。</p>
          </div>
          <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            客戶管理
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="GBP 曝光" value={summary.totalImpressions} />
          <StatCard label="總互動" value={summary.totalActions} />
          <StatCard label="網站點擊" value={summary.websiteClicks} />
          <StatCard label="電話 + 路線" value={summary.phoneCalls + summary.directionRequests} />
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900">新增 GBP 洞察紀錄</CardTitle>
            <CardDescription>先支援手動錄入與匯入落表；Google Business Profile API 拉取會在後續 PR 接上。</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">尚無客戶資料，請先完成 customer foundation。</p>
            ) : (
              <GbpInsightForm customers={customers} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>日期</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead className="text-right">曝光</TableHead>
                <TableHead className="text-right">網站</TableHead>
                <TableHead className="text-right">電話</TableHead>
                <TableHead className="text-right">路線</TableHead>
                <TableHead className="text-right">訊息</TableHead>
                <TableHead className="text-right">來源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400">
                    尚無 GBP 洞察資料
                  </TableCell>
                </TableRow>
              ) : (
                insights.map((insight) => (
                  <TableRow key={insight.id} className="hover:bg-emerald-50/20">
                    <TableCell className="font-semibold text-slate-800">
                      {new Date(`${insight.date}T00:00:00`).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{insight.customer?.store_name ?? '-'}</div>
                      <div className="text-xs text-slate-500">{insight.customer?.email ?? ''}</div>
                    </TableCell>
                    <MetricCell value={insight.business_impressions} />
                    <MetricCell value={insight.website_clicks} />
                    <MetricCell value={insight.phone_calls} />
                    <MetricCell value={insight.direction_requests} />
                    <MetricCell value={insight.messages} />
                    <TableCell className="text-right text-sm text-slate-500">{insight.source}</TableCell>
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
        <p className="text-3xl font-extrabold tabular-nums text-slate-900">{value.toLocaleString('zh-TW')}</p>
      </CardContent>
    </Card>
  );
}

function MetricCell({ value }: { value: number }) {
  return <TableCell className="text-right font-semibold tabular-nums text-slate-700">{value.toLocaleString('zh-TW')}</TableCell>;
}
