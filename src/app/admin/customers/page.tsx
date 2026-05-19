import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listCustomers } from '@/lib/customers';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  pending_onboarding: '待填表',
  pending_review: '待 review',
  active: '服務中',
  paused: '暫停',
  cancelled: '已取消',
  churned: '已流失',
};

const statusClasses: Record<string, string> = {
  pending_onboarding: 'bg-slate-100 text-slate-600 border-slate-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  churned: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; plan?: string }>;
}) {
  const filters = await searchParams;
  const customers = await listCustomers(filters);
  const stats = {
    total: customers.length,
    pendingReview: customers.filter((customer) => customer.service_status === 'pending_review').length,
    active: customers.filter((customer) => customer.service_status === 'active').length,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">Track B</p>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">客戶管理</h1>
            <p className="mt-1 text-sm text-slate-500">Stripe 成交後客戶、onboarding 狀態與服務狀態。</p>
          </div>
          <Link href="/admin" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            回後台首頁
          </Link>
          <Link href="/admin/posts" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            GBP 文案庫
          </Link>
          <Link href="/admin/reviews?unanswered=true" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
            待回覆評論
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="總客戶" value={stats.total} />
          <StatCard label="待 review" value={stats.pendingReview} />
          <StatCard label="服務中" value={stats.active} />
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>店家</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>城市</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    尚無客戶資料
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-emerald-50/20">
                    <TableCell>
                      <div className="font-bold text-slate-900">{customer.store_name}</div>
                      <div className="text-xs text-slate-500">{customer.name}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{customer.email}</TableCell>
                    <TableCell className="text-slate-600">{customer.store_city ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClasses[customer.service_status]}>
                        {statusLabels[customer.service_status] ?? customer.service_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(customer.created_at).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/customers/${customer.id}`} className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
                        查看
                      </Link>
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
    <Card className="border-slate-200">
      <CardContent className="p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
