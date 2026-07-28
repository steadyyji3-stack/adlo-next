'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
  const [signatureItems, setSignatureItems] = useState(() => {
    const items = initialCustomer.signatureItems ?? [];
    return [...items, ...emptyItems].slice(0, 5);
  });
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      storeProfile: {
        storeName,
        industry,
        selectedTags: splitList(selectedTags),
        weekTheme,
        businessType,
        channels: splitList(channels),
      },
      storeAddress: String(formData.get('storeAddress') ?? ''),
      storeCity: String(formData.get('storeCity') ?? ''),
      gbpUrl: String(formData.get('gbpUrl') ?? ''),
      websiteUrl: String(formData.get('websiteUrl') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      lineId: String(formData.get('lineId') ?? ''),
      signatureItems: signatureItems.map((item) => item.trim()).filter(Boolean),
      notes: String(formData.get('notes') ?? ''),
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="店家名稱" id="storeName" required>
          <Input
            id="storeName"
            name="storeName"
            required
            minLength={2}
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            className="h-12 bg-white"
          />
        </Field>
        <Field label="行業" id="industry" required>
          <select
            id="industry"
            name="industry"
            required
            value={industry}
            onChange={(event) => setIndustry(event.target.value as StoreProfile['industry'])}
            className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            {Object.keys(INDUSTRY_TAGS).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="業態" id="businessType" required>
          <select
            id="businessType"
            name="businessType"
            required
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value as BusinessType)}
            className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            {businessTypes.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="所在城市" id="storeCity">
          <Input id="storeCity" name="storeCity" defaultValue={initialCustomer.storeCity ?? ''} placeholder="例：台北市" className="h-12 bg-white" />
        </Field>
        <Field label="聯絡電話" id="phone">
          <Input id="phone" name="phone" defaultValue={initialCustomer.phone ?? ''} className="h-12 bg-white" />
        </Field>
        <Field label="LINE ID" id="lineId">
          <Input id="lineId" name="lineId" defaultValue={initialCustomer.lineId ?? ''} className="h-12 bg-white" />
        </Field>
        <Field label="網站 URL" id="websiteUrl">
          <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={initialCustomer.websiteUrl ?? ''} placeholder="https://example.com" className="h-12 bg-white" />
        </Field>
        <Field label="Google 商家網址" id="gbpUrl" help="有 Google 商家再填，系統不會要求 Google 帳號授權。">
          <Input id="gbpUrl" name="gbpUrl" type="url" defaultValue={initialCustomer.gbpUrl ?? ''} placeholder="https://maps.google.com/..." className="h-12 bg-white" />
        </Field>
      </div>

      <Field label="店家地址" id="storeAddress">
        <Input id="storeAddress" name="storeAddress" defaultValue={initialCustomer.storeAddress ?? ''} className="h-12 bg-white" />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="店家特色標籤" id="selectedTags" help="以逗號或頓號分隔，會沿用到每週素材。">
          <Input id="selectedTags" value={selectedTags} onChange={(event) => setSelectedTags(event.target.value)} placeholder="例：親子友善、預約制、手工製作" className="h-12 bg-white" />
        </Field>
        <Field label="主要通路" id="channels" help="以逗號或頓號分隔。">
          <Input id="channels" value={channels} onChange={(event) => setChannels(event.target.value)} placeholder="例：Google 商家、LINE、官網" className="h-12 bg-white" />
        </Field>
      </div>

      <Field label="本週主題" id="weekTheme">
        <Input id="weekTheme" value={weekTheme} onChange={(event) => setWeekTheme(event.target.value)} placeholder="例：暑假親子活動" className="h-12 bg-white" />
      </Field>

      <div>
        <Label className="mb-2 block text-sm font-semibold text-slate-900">
          招牌商品 / 服務 <span className="text-rose-500">*</span>
        </Label>
        <div className="grid gap-3 md:grid-cols-5">
          {signatureItems.map((item, index) => (
            <Input
              key={index}
              value={item}
              onChange={(event) => {
                const next = [...signatureItems];
                next[index] = event.target.value;
                setSignatureItems(next);
              }}
              placeholder={`項目 ${index + 1}`}
              aria-label={`招牌商品或服務 ${index + 1}`}
              className="h-12 bg-white"
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">至少 1 個，最多 5 個。</p>
      </div>

      <Field label="補充說明" id="notes">
        <Textarea id="notes" name="notes" rows={5} className="bg-white" />
      </Field>

      {state === 'error' && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {message}
        </div>
      )}

      <Button type="submit" disabled={state === 'submitting'} className="h-12 w-full bg-[#1D9E75] text-base font-bold text-white hover:bg-[#168060]">
        {state === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            建立中
          </>
        ) : (
          '建立店家檔案'
        )}
      </Button>
    </form>
  );
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
