import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listAdminAdSpend, summarizeAdSpend, type AdSpendPlatform } from '@/lib/ad-spend';
import { listCustomers } from '@/lib/customers';
import { AdSpendForm } from './AdSpendForm';

export const dynamic = 'force-dynamic';

const platformLabels: Record<AdSpendPlatform, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
};

const platformClasses: Record<AdSpendPlatform, string> = {
  google_ads: 'border-blue-200 bg-blue-50 text-blue-700',
  meta_ads: 'border-slate-200 bg-slate-100 text-slate-700',
};

export default async function AdminAdSpendPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; platform?: AdSpendPlatform }>;
}) {
  const filters = await searchParams;
  const [customers, rows] = await Promise.all([
    listCustomers(),
    listAdminAdSpend({ customerId: filters.customer_id, platform: filters.platform }),
  ]);
  const summary = summarizeAdSpend(rows);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B4</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">廣告花費</h1>
            <p className="mt-1 text-sm text-slate-500">Ads Managed 方案的每日花費、曝光、點擊與轉換資料。</p>
          </div>
          <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            客戶管理
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="總花費" value={`NT$${summary.totalSpendNtd.toLocaleString('zh-TW')}`} />
          <StatCard label="曝光" value={summary.impressions.toLocaleString('zh-TW')} />
          <StatCard label="點擊" value={summary.clicks.toLocaleString('zh-TW')} />
          <StatCard label="平均 CPC" value={summary.averageCpcNtd === null ? '-' : `NT$${summary.averageCpcNtd.toLocaleString('zh-TW')}`} />
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900">新增或更新每日廣告花費</CardTitle>
            <CardDescription>同一客戶、日期、平台會覆蓋既有紀錄；Google Ads API 與 cron 會在後續 PR 接上。</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">尚無客戶資料，請先完成 customer foundation。</p>
            ) : (
              <AdSpendForm customers={customers} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>日期</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>平台</TableHead>
                <TableHead className="text-right">花費</TableHead>
                <TableHead className="text-right">曝光</TableHead>
                <TableHead className="text-right">點擊</TableHead>
                <TableHead className="text-right">轉換</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    尚無廣告花費資料
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-emerald-50/20">
                    <TableCell className="font-semibold text-slate-800">
                      {new Date(`${row.date}T00:00:00`).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{row.customer?.store_name ?? '-'}</div>
                      <div className="text-xs text-slate-500">{row.customer?.email ?? ''}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={platformClasses[row.platform]}>
                        {platformLabels[row.platform]}
                      </Badge>
                    </TableCell>
                    <MetricCell value={`NT$${Number(row.spend_ntd).toLocaleString('zh-TW')}`} />
                    <MetricCell value={(row.impressions ?? 0).toLocaleString('zh-TW')} />
                    <MetricCell value={(row.clicks ?? 0).toLocaleString('zh-TW')} />
                    <MetricCell value={(row.conversions ?? 0).toLocaleString('zh-TW')} />
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricCell({ value }: { value: string }) {
  return <TableCell className="text-right font-semibold tabular-nums text-slate-700">{value}</TableCell>;
}
