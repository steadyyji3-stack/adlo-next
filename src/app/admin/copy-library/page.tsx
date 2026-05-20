import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listCustomers } from '@/lib/customers';
import { listAdminCopyAssets, type CopyAssetChannel, type CopyAssetStatus } from '@/lib/copy-assets';
import { CopyAssetForm } from './CopyAssetForm';
import { CopyAssetStatusButton } from './CopyAssetStatusButton';

export const dynamic = 'force-dynamic';

const channelLabels: Record<CopyAssetChannel, string> = {
  gbp_post: 'GBP 貼文',
  review_reply: '評論回覆',
  monthly_report: '月報',
  ads_copy: '廣告文案',
};

const statusLabels: Record<CopyAssetStatus, string> = {
  draft: '草稿',
  approved: '已核准',
  archived: '封存',
};

const statusClasses: Record<CopyAssetStatus, string> = {
  draft: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  archived: 'border-slate-200 bg-slate-100 text-slate-600',
};

export default async function AdminCopyLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; channel?: CopyAssetChannel; status?: CopyAssetStatus }>;
}) {
  const filters = await searchParams;
  const [customers, assets] = await Promise.all([
    listCustomers(),
    listAdminCopyAssets({
      customerId: filters.customer_id,
      channel: filters.channel,
      status: filters.status,
    }),
  ]);
  const approvedCount = assets.filter((asset) => asset.status === 'approved').length;
  const draftCount = assets.filter((asset) => asset.status === 'draft').length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B3</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">文案庫</h1>
            <p className="mt-1 text-sm text-slate-500">集中管理成交後服務可重複使用的 GBP、評論、月報與廣告文案。</p>
          </div>
          <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            客戶管理
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="文案總數" value={assets.length} />
          <StatCard label="已核准" value={approvedCount} />
          <StatCard label="草稿" value={draftCount} />
        </div>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-slate-900">新增文案素材</CardTitle>
            <CardDescription>先建立人工審核素材池；自動生成、GBP 發布與月報套用會在後續 PR 接上。</CardDescription>
          </CardHeader>
          <CardContent>
            <CopyAssetForm customers={customers} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>文案</TableHead>
                <TableHead>用途</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    尚無文案素材
                  </TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-emerald-50/20">
                    <TableCell className="max-w-xl">
                      <div className="font-bold text-slate-900">{asset.title}</div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{asset.body}</p>
                      {asset.tags?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {asset.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{channelLabels[asset.channel]}</div>
                      <div className="text-xs text-slate-500">{asset.category ?? '未分類'} · {asset.tone ?? '未指定語氣'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{asset.customer?.store_name ?? '通用素材'}</div>
                      <div className="text-xs text-slate-500">{asset.customer?.email ?? ''}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClasses[asset.status]}>
                        {statusLabels[asset.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {asset.status !== 'approved' && (
                          <CopyAssetStatusButton assetId={asset.id} status="approved" label="核准" />
                        )}
                        {asset.status !== 'archived' && (
                          <CopyAssetStatusButton assetId={asset.id} status="archived" label="封存" />
                        )}
                      </div>
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
