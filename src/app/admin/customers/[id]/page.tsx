import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getCustomerDetail } from '@/lib/customers';
import { ApproveButton } from './ApproveButton';

export const dynamic = 'force-dynamic';

const statusClasses: Record<string, string> = {
  pending_onboarding: 'bg-slate-100 text-slate-600 border-slate-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  churned: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          找不到客戶資料。
        </div>
      </main>
    );
  }

  const latestSubscription = customer.subscriptions[0];
  const latestSubmission = customer.onboarding_submissions[0];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin/customers" className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
              客戶管理
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{customer.store_name}</h1>
            <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={statusClasses[customer.service_status]}>
              {customer.service_status}
            </Badge>
            <Link href={`/admin/reports/${customer.id}/preview`} className="text-sm font-bold text-[#1D9E75] underline-offset-4 hover:underline">
              月報預覽
            </Link>
            <ApproveButton customerId={customer.id} disabled={customer.service_status !== 'pending_review'} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <InfoCard title="客戶資料">
              <InfoRow label="客戶姓名" value={customer.name} />
              <InfoRow label="電話" value={customer.phone} />
              <InfoRow label="LINE ID" value={customer.line_id} />
              <InfoRow label="城市" value={customer.store_city} />
              <InfoRow label="地址" value={customer.store_address} />
              <InfoRow label="行業" value={customer.industry} />
              <InfoRow label="網站" value={customer.website_url} />
              <InfoRow label="GBP URL" value={customer.gbp_url} />
            </InfoCard>

            <InfoCard title="招牌商品 / 服務">
              {customer.signature_items?.length ? (
                <div className="flex flex-wrap gap-2">
                  {customer.signature_items.map((item) => (
                    <Badge key={item} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">尚未填寫</p>
              )}
            </InfoCard>
          </section>

          <aside className="space-y-6">
            <InfoCard title="訂閱">
              {latestSubscription ? (
                <>
                  <InfoRow label="方案" value={latestSubscription.plan_id} />
                  <InfoRow label="狀態" value={latestSubscription.status} />
                  <InfoRow label="週期結束" value={new Date(latestSubscription.current_period_end).toLocaleDateString('zh-TW')} />
                </>
              ) : (
                <p className="text-sm text-slate-500">尚無訂閱資料</p>
              )}
            </InfoCard>

            <InfoCard title="Onboarding">
              {latestSubmission ? (
                <>
                  <InfoRow label="狀態" value={latestSubmission.status} />
                  <InfoRow label="GA4" value={latestSubmission.ga4_property_id} />
                  <InfoRow label="Meta Page" value={latestSubmission.meta_page_id} />
                  <InfoRow label="送出時間" value={new Date(latestSubmission.created_at).toLocaleString('zh-TW')} />
                  {latestSubmission.notes && (
                    <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{latestSubmission.notes}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">尚未送出 onboarding</p>
              )}
            </InfoCard>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-6">
        <h2 className="mb-5 text-lg font-extrabold text-slate-900">{title}</h2>
        <div className="space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="break-all text-right font-semibold text-slate-800">{value || '-'}</span>
    </div>
  );
}
