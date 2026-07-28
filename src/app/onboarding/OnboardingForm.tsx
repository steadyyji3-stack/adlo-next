'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { INDUSTRY_TAGS } from '@/lib/gbp-post-writer';
import {
  getStoreProfileServerSnapshot,
  getStoreProfileSnapshot,
  subscribeStoreProfile,
  type BusinessType,
  type StoreProfile,
} from '@/lib/store-profile';

const businessTypes: BusinessType[] = ['在地店家', '電商品牌', '實體+電商'];
const emptyItems = ['', '', '', '', ''];

interface InitialCustomer {
  phone: string | null;
  lineId: string | null;
  storeName: string;
  storeAddress: string | null;
  storeCity: string | null;
  gbpUrl: string | null;
  websiteUrl: string | null;
  industry: string | null;
  signatureItems: string[] | null;
}

export function OnboardingForm({
  initialProfile,
  initialCustomer,
}: {
  initialProfile: StoreProfile | null;
  initialCustomer: InitialCustomer;
}) {
  const localProfile = useSyncExternalStore(
    subscribeStoreProfile,
    getStoreProfileSnapshot,
    getStoreProfileServerSnapshot,
  );
  const profile = initialProfile ?? localProfile;
  const profileKey = profile?.savedAt ?? 'empty';

  return (
    <OnboardingFormFields
      key={profileKey}
      initialProfile={profile}
      initialCustomer={initialCustomer}
    />
  );
}

function OnboardingFormFields({
  initialProfile,
  initialCustomer,
}: {
  initialProfile: StoreProfile | null;
  initialCustomer: InitialCustomer;
}) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(
    initialProfile?.storeName ?? initialCustomer.storeName,
  );
  const [industry, setIndustry] = useState(
    initialProfile?.industry ?? initialCustomer.industry ?? '其他',
  );
  const [businessType, setBusinessType] = useState<BusinessType>(
    initialProfile?.businessType ?? '在地店家',
  );
  const [selectedTags, setSelectedTags] = useState(
    initialProfile?.selectedTags.join('、') ?? '',
  );
  const [weekTheme, setWeekTheme] = useState(initialProfile?.weekTheme ?? '');
  const [channels, setChannels] = useState(
    initialProfile?.channels?.join('、') ?? '',
  );
  const [storeAddress, setStoreAddress] = useState(initialCustomer.storeAddress ?? '');
  const [storeCity, setStoreCity] = useState(initialCustomer.storeCity ?? '');
  const [phone, setPhone] = useState(initialCustomer.phone ?? '');
  const [lineId, setLineId] = useState(initialCustomer.lineId ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(initialCustomer.websiteUrl ?? '');
  const [gbpUrl, setGbpUrl] = useState(initialCustomer.gbpUrl ?? '');
  const [notes, setNotes] = useState('');
  const [signatureItems, setSignatureItems] = useState(() => {
    const items = initialCustomer.signatureItems ?? [];
    return [...items, ...emptyItems].slice(0, 5);
  });
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  const completedItems = signatureItems.map((item) => item.trim()).filter(Boolean);

  function goNext() {
    if (step === 1 && storeName.trim().length < 2) {
      setMessage('請先填寫店家名稱。');
      return;
    }
    if (step === 2 && completedItems.length === 0) {
      setMessage('請至少填寫一項招牌商品或服務。');
      return;
    }
    setMessage('');
    setStep((current) => Math.min(4, current + 1));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setMessage('');

    const payload = {
      storeProfile: {
        storeName,
        industry,
        selectedTags: splitList(selectedTags),
        weekTheme,
        businessType,
        channels: splitList(channels),
      },
      storeAddress,
      storeCity,
      gbpUrl,
      websiteUrl,
      phone,
      lineId,
      signatureItems: completedItems,
      notes,
    };

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setState('error');
        setMessage(data.error?.message ?? '送出失敗，請稍後再試');
        return;
      }

      setState('success');
      router.push('/customer/week?generate=1');
    } catch {
      setState('error');
      setMessage('網路錯誤，請稍後再試');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#1D9E75]" aria-hidden />
        <h2 className="text-2xl font-extrabold text-slate-900">店家檔案已建立</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          資料已同步到客戶後台，不需要等待人工審核。
        </p>
        <Button asChild className="mt-6 bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
          <Link href="/customer/week?generate=1">產生第一個本週任務</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-y border-slate-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
      <OnboardingSteps currentStep={step} />

      <div className="mx-auto mt-8 max-w-2xl">
        {step === 1 && (
          <section aria-labelledby="onboarding-step-1">
            <StepHeading id="onboarding-step-1" title="先告訴我們這是哪一家店" body="基本資料就好，不需要懂行銷名詞。" />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="店家名稱" id="storeName" required>
                <Input id="storeName" required minLength={2} value={storeName} onChange={(event) => setStoreName(event.target.value)} className="h-12 bg-white" autoFocus />
              </Field>
              <Field label="行業" id="industry" required>
                <select id="industry" required value={industry} onChange={(event) => setIndustry(event.target.value as StoreProfile['industry'])} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  {Object.keys(INDUSTRY_TAGS).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="經營方式" id="businessType" required>
                <select id="businessType" required value={businessType} onChange={(event) => setBusinessType(event.target.value as BusinessType)} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                  {businessTypes.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              <Field label="所在城市" id="storeCity">
                <Input id="storeCity" value={storeCity} onChange={(event) => setStoreCity(event.target.value)} placeholder="例：台北市" className="h-12 bg-white" />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="店家地址" id="storeAddress">
                <Input id="storeAddress" value={storeAddress} onChange={(event) => setStoreAddress(event.target.value)} className="h-12 bg-white" />
              </Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="onboarding-step-2">
            <StepHeading id="onboarding-step-2" title="客人最常為了什麼找你？" body="先填一項招牌商品或服務，系統才不會給你空泛的建議。" />
            <div className="mt-6">
              <Label className="mb-2 block text-sm font-semibold text-slate-900">招牌商品 / 服務 <span className="text-rose-500">*</span></Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {signatureItems.map((item, index) => (
                  <Input key={index} value={item} onChange={(event) => { const next = [...signatureItems]; next[index] = event.target.value; setSignatureItems(next); }} placeholder={index === 0 ? '例：兒童定期牙齒檢查' : `其他項目 ${index + 1}`} aria-label={`招牌商品或服務 ${index + 1}`} className="h-12 bg-white" autoFocus={index === 0} />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">至少 1 個，最多 5 個。</p>
            </div>
            <div className="mt-5">
              <Field label="店家特色" id="selectedTags" help="用逗號分開即可。">
                <Input id="selectedTags" value={selectedTags} onChange={(event) => setSelectedTags(event.target.value)} placeholder="例：親子友善、預約制、手工製作" className="h-12 bg-white" />
              </Field>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="onboarding-step-3">
            <StepHeading id="onboarding-step-3" title="客人在哪裡找到你？" body="有的就填，沒有的可以留白。系統不會要求你的 Google 帳號權限。" />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="聯絡電話" id="phone"><Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="h-12 bg-white" /></Field>
              <Field label="LINE ID" id="lineId"><Input id="lineId" value={lineId} onChange={(event) => setLineId(event.target.value)} className="h-12 bg-white" /></Field>
              <Field label="網站網址" id="websiteUrl"><Input id="websiteUrl" type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://example.com" className="h-12 bg-white" /></Field>
              <Field label="Google 商家網址" id="gbpUrl" help="只保存公開網址，不要求帳號授權。"><Input id="gbpUrl" type="url" value={gbpUrl} onChange={(event) => setGbpUrl(event.target.value)} placeholder="https://maps.google.com/..." className="h-12 bg-white" /></Field>
            </div>
            <div className="mt-5">
              <Field label="目前常用的管道" id="channels" help="用逗號分開即可。">
                <Input id="channels" value={channels} onChange={(event) => setChannels(event.target.value)} placeholder="例：Google 商家、LINE、官網" className="h-12 bg-white" />
              </Field>
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="onboarding-step-4">
            <StepHeading id="onboarding-step-4" title="確認後，立即準備第一個任務" body="送出後不用等待人工審核，系統會直接帶你完成第一週。" />
            <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
              <SummaryRow label="店家" value={`${storeName}${storeCity ? ` · ${storeCity}` : ''}`} />
              <SummaryRow label="招牌項目" value={completedItems.join('、')} />
              <SummaryRow label="目前管道" value={splitList(channels).join('、') || '尚未填寫'} />
              <SummaryRow label="帳號授權" value="不需要 Google 帳號授權" />
            </dl>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field label="這週想優先處理（選填）" id="weekTheme"><Input id="weekTheme" value={weekTheme} onChange={(event) => setWeekTheme(event.target.value)} placeholder="例：暑假親子活動" className="h-12 bg-white" /></Field>
              <Field label="其他補充（選填）" id="notes"><Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="有特別限制再告訴我們" className="min-h-12 bg-white" /></Field>
            </div>
          </section>
        )}

        {message && (
          <div role="alert" className={`mt-6 rounded-md border p-4 text-sm ${state === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{message}</div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={() => { setMessage(''); setStep((current) => Math.max(1, current - 1)); }} className="font-bold"><ChevronLeft className="h-4 w-4" aria-hidden />上一步</Button>
          ) : <span />}
          {step < 4 ? (
            <Button key="onboarding-next" type="button" onClick={goNext} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">下一步<ChevronRight className="h-4 w-4" aria-hidden /></Button>
          ) : (
            <Button key="onboarding-submit" type="submit" disabled={state === 'submitting'} className="bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
              {state === 'submitting' ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />正在準備</> : <><Check className="h-4 w-4" aria-hidden />確認並產生第一個任務</>}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

const onboardingStepLabels = ['店家', '招牌項目', '聯絡管道', '確認'];

function OnboardingSteps({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mx-auto grid max-w-2xl grid-cols-4" aria-label={`設定進度，第 ${currentStep} 步，共 4 步`}>
      {onboardingStepLabels.map((label, index) => {
        const number = index + 1;
        const completed = number < currentStep;
        const active = number === currentStep;
        return (
          <li key={label} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 && <span className={`absolute right-1/2 top-4 h-px w-full ${number <= currentStep ? 'bg-[#1D9E75]' : 'bg-slate-200'}`} aria-hidden />}
            <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold ${completed || active ? 'bg-[#1D9E75] text-white' : 'bg-slate-100 text-slate-400'}`}>{completed ? <Check className="h-4 w-4" aria-hidden /> : number}</span>
            <span className={`text-xs font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StepHeading({ id, title, body }: { id: string; title: string; body: string }) {
  return <div><p className="text-xs font-extrabold text-[#0F6E56]">目前只要完成這一步</p><h2 id={id} className="mt-2 text-xl font-extrabold text-slate-950 sm:text-2xl">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-4 sm:grid-cols-[120px_1fr]"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="text-sm font-semibold leading-6 text-slate-900">{value}</dd></div>;
}

function splitList(value: string) {
  return Array.from(
    new Set(value.split(/[，,、]/).map((item) => item.trim()).filter(Boolean)),
  );
}

function Field({
  label,
  id,
  required,
  help,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
      {help && (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-slate-500">
          {help}
        </p>
      )}
    </div>
  );
}
