'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, UserX, Shield, Zap } from 'lucide-react';
import { CPC_REFERENCE, type AdBudgetInput } from '@/lib/ad-budget';

interface Props {
  onSubmit: (input: AdBudgetInput) => void;
}

export default function AdBudgetHero({ onSubmit }: Props) {
  const [avgOrderValue, setAvgOrderValue] = useState('');
  const [grossMarginPct, setGrossMarginPct] = useState('');
  const [conversionRatePct, setConversionRatePct] = useState('');
  const [cpc, setCpc] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [error, setError] = useState('');

  function num(v: string) {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const aov = num(avgOrderValue);
    const margin = num(grossMarginPct);
    const conv = num(conversionRatePct);
    const cpcN = num(cpc);
    const budget = monthlyBudget.trim() ? num(monthlyBudget) : undefined;

    if (!(aov > 0)) return setError('請填客單價（大於 0）');
    if (!(margin > 0 && margin <= 100)) return setError('毛利率請填 1–100');
    if (!(conv > 0 && conv <= 100)) return setError('轉換率請填 0–100（大於 0）');
    if (!(cpcN > 0)) return setError('請填每次點擊成本 CPC（大於 0）');
    if (budget !== undefined && !(budget > 0)) return setError('每月預算請填大於 0，或留空');

    setError('');
    onSubmit({
      avgOrderValue: aov,
      grossMarginPct: margin,
      conversionRatePct: conv,
      cpc: cpcN,
      monthlyBudget: budget,
    });
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-24">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E1F5EE] border border-[#1D9E75]/30 mb-5">
            <Calculator className="w-7 h-7 text-[#1D9E75]" aria-hidden />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            免費 · 不用註冊 · 不抓店家資料
          </div>

          <h1 className="text-[30px] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            該不該投 <span className="text-[#1D9E75]">Google 廣告</span>？先算清楚
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            用你自己的數字，30 秒算出「每次點擊最多能付多少還不虧」。別等燒完一個月才發現一直在賠。
          </p>

          <div className="mt-6 mx-auto max-w-xl flex items-start gap-3 text-left bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-xl p-4">
            <Zap className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" aria-hidden />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">這是試算，不是 AI 聊天。</strong>
              全部在你的瀏覽器算，數字不上傳、不儲存。
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8 space-y-5"
        >
          <NumField id="aov" label="客單價（每筆成交平均收入）" unit="NT$" value={avgOrderValue} onChange={(v) => { setAvgOrderValue(v); setError(''); }} placeholder="例：800" required />
          <NumField id="margin" label="毛利率（扣成本後、未扣廣告）" unit="%" value={grossMarginPct} onChange={(v) => { setGrossMarginPct(v); setError(''); }} placeholder="例：40" required />
          <NumField id="conv" label="轉換率（點進來 → 真的成交）" unit="%" value={conversionRatePct} onChange={(v) => { setConversionRatePct(v); setError(''); }} placeholder="例：3" required hint="不確定就先抓 2–5%，多數在地服務落在這。" />

          <div>
            <NumField id="cpc" label="每次點擊成本 CPC" unit="NT$" value={cpc} onChange={(v) => { setCpc(v); setError(''); }} placeholder="例：25" required />
            <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">不知道你的 CPC？點一個概估參考帶入（實際以關鍵字工具為準）：</p>
              <div className="flex flex-col gap-1.5">
                {CPC_REFERENCE.map((r) => (
                  <button
                    type="button"
                    key={r.label}
                    onClick={() => { setCpc(String(r.mid)); setError(''); }}
                    className="text-left text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <span className="font-medium text-slate-700">{r.label}</span>
                    <span className="text-slate-500"> · {r.range}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <NumField id="budget" label="每月想投的預算" unit="NT$" value={monthlyBudget} onChange={(v) => { setMonthlyBudget(v); setError(''); }} placeholder="選填，例：15000" hintLabel="（選填，算給你預估成效）" />

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
            data-gtm-event="ad_budget_calculate"
          >
            <Calculator className="w-4 h-4 mr-2" aria-hidden />
            算我的損益兩平點
          </Button>

          {error && (
            <p role="alert" className="text-sm text-rose-600 text-center">
              {error}
            </p>
          )}
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 數字不上傳
          </li>
          <li className="inline-flex items-center gap-2">
            <Calculator className="size-4 text-emerald-600" aria-hidden /> 30 秒出結果
          </li>
        </ul>
      </div>
    </section>
  );
}

function NumField({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder,
  required,
  hint,
  hintLabel,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  hintLabel?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-semibold text-slate-900 mb-2 block">
        {label}{' '}
        {required ? (
          <span className="text-rose-500">*</span>
        ) : hintLabel ? (
          <span className="text-slate-500 font-normal text-xs">{hintLabel}</span>
        ) : null}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{unit}</span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 text-base pl-12"
          aria-required={required}
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
