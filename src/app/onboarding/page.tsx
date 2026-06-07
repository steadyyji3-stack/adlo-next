import { OnboardingForm } from './OnboardingForm';
import { getCustomerIdFromSession } from '@/lib/customer-auth';

export default async function OnboardingPage() {
  const customerId = await getCustomerIdFromSession();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[#0F6E56]">adlo onboarding</p>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">開始建立你的成交後服務</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            請填寫商家資料與必要授權資訊。這份表單送出後會進入後台 review，不會直接對你的 Google 商家或廣告帳戶做任何寫入。
          </p>
        </div>

        {customerId ? (
          <OnboardingForm />
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
            請先使用 adlo 寄出的 email magic link 登入，再填寫 onboarding 表單。
          </div>
        )}
      </div>
    </main>
  );
}
