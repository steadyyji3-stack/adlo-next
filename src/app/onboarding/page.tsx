import { OnboardingForm } from './OnboardingForm';
import { getCustomerIdFromSession } from '@/lib/customer-auth';
import { getCustomerStoreProfile } from '@/lib/customer-store-profile';
import { getCustomerDetail } from '@/lib/customers';

export default async function OnboardingPage() {
  const customerId = await getCustomerIdFromSession();
  const [profile, customer] = customerId
    ? await Promise.all([
      getCustomerStoreProfile(customerId),
      getCustomerDetail(customerId),
    ])
    : [null, null];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">adlo onboarding</p>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">開始建立你的成交後服務</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            填完後會立即建立店家檔案並同步到客戶後台，不需要等待人工審核，也不會要求 Google 帳號授權。
          </p>
        </div>

        {customerId && customer ? (
          <OnboardingForm
            initialProfile={profile}
            initialCustomer={{
              phone: customer.phone,
              lineId: customer.line_id,
              storeName: customer.store_name,
              storeAddress: customer.store_address,
              storeCity: customer.store_city,
              gbpUrl: customer.gbp_url,
              websiteUrl: customer.website_url,
              industry: customer.industry,
              signatureItems: customer.signature_items,
            }}
          />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
            請先使用 adlo 寄出的 email magic link 登入，再填寫 onboarding 表單。
          </div>
        )}
      </div>
    </main>
  );
}
