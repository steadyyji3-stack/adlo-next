'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface OnboardingFormProps {
  customerId: string;
}

const emptyItems = ['', '', '', '', ''];

export function OnboardingForm({ customerId }: OnboardingFormProps) {
  const [signatureItems, setSignatureItems] = useState(emptyItems);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      customerId,
      storeName: String(formData.get('storeName') ?? ''),
      storeAddress: String(formData.get('storeAddress') ?? ''),
      storeCity: String(formData.get('storeCity') ?? ''),
      gbpUrl: String(formData.get('gbpUrl') ?? ''),
      websiteUrl: String(formData.get('websiteUrl') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      lineId: String(formData.get('lineId') ?? ''),
      industry: String(formData.get('industry') ?? ''),
      signatureItems: signatureItems.map((item) => item.trim()).filter(Boolean),
      ga4PropertyId: String(formData.get('ga4PropertyId') ?? ''),
      metaPageId: String(formData.get('metaPageId') ?? ''),
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
    } catch {
      setState('error');
      setMessage('網路錯誤，請稍後再試');
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#1D9E75]" aria-hidden />
        <h2 className="text-2xl font-extrabold text-slate-900">資料已送出</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          我們會先 review 你的商家資料，再開始建立第一個月的執行排程。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="店家名稱" id="storeName" required>
          <Input id="storeName" name="storeName" required aria-required="true" className="h-12 bg-white" />
        </Field>
        <Field label="行業" id="industry">
          <Input id="industry" name="industry" placeholder="例：餐飲 / 美業 / 診所" className="h-12 bg-white" />
        </Field>
        <Field label="所在城市" id="storeCity">
          <Input id="storeCity" name="storeCity" placeholder="例：台北市" className="h-12 bg-white" />
        </Field>
        <Field label="聯絡電話" id="phone">
          <Input id="phone" name="phone" className="h-12 bg-white" />
        </Field>
        <Field label="LINE ID" id="lineId">
          <Input id="lineId" name="lineId" className="h-12 bg-white" />
        </Field>
        <Field label="網站 URL" id="websiteUrl">
          <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://example.com" className="h-12 bg-white" />
        </Field>
      </div>

      <Field label="Google 商家網址" id="gbpUrl" required help="請貼上你的 Google Business Profile / Google Maps 店家網址。">
        <Input id="gbpUrl" name="gbpUrl" type="url" required aria-required="true" aria-describedby="gbpUrl-help" className="h-12 bg-white" />
      </Field>

      <Field label="店家地址" id="storeAddress">
        <Input id="storeAddress" name="storeAddress" className="h-12 bg-white" />
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

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="GA4 Property ID" id="ga4PropertyId">
          <Input id="ga4PropertyId" name="ga4PropertyId" className="h-12 bg-white" />
        </Field>
        <Field label="Meta Page ID" id="metaPageId">
          <Input id="metaPageId" name="metaPageId" className="h-12 bg-white" />
        </Field>
      </div>

      <Field label="補充說明" id="notes">
        <Textarea id="notes" name="notes" rows={5} className="bg-white" />
      </Field>

      {state === 'error' && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {message}
        </div>
      )}

      <Button type="submit" disabled={state === 'submitting'} className="h-12 w-full bg-[#1D9E75] text-base font-bold text-white hover:bg-[#168060]">
        {state === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            送出中
          </>
        ) : (
          '送出 onboarding 資料'
        )}
      </Button>
    </form>
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
