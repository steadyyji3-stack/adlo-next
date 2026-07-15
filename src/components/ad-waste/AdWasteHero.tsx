'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingDown, Check, ShieldCheck, Timer, Wallet } from 'lucide-react';
import {
  BUDGET_LEVELS,
  MANAGER_TYPES,
  type AdWasteInput,
  type AdWasteStatus,
  type BudgetLevel,
  type ManagerType,
} from '@/lib/ad-waste';

interface Props {
  onSubmit: (input: AdWasteInput) => void;
}

const INDUSTRY_GROUPS: { label: string; items: string[] }[] = [
  { label: '餐飲', items: ['餐廳 / 正餐', '小吃 / 便當', '咖啡 / 飲料店', '甜點 / 烘焙'] },
  { label: '美容 / 健康', items: ['美髮 / 美容', '美甲 / 美睫', 'SPA / 按摩', '健身 / 瑜伽', '醫美', '牙科'] },
  { label: '生活服務', items: ['零售 / 服飾', '住宿 / 民宿', '寵物服務', '花藝 / 園藝', '攝影'] },
  { label: '裝潢修繕', items: ['裝潢', '裝修', '安裝', '維修'] },
  { label: '專業服務', items: ['律師 / 會計', '補習 / 教育', '顧問 / 諮詢', '其他'] },
];

const BOOLEAN_CHECKS: { key: keyof AdWasteStatus; label: string }[] = [
  { key: 'hasNegativeKeywords', label: '有在維護「排除關鍵字」清單' },
  { key: 'hasConversionTracking', label: '有安裝轉換追蹤（看得到來電／表單）' },
  { key: 'checksSearchTerms', label: '每月有看「搜尋字詞報表」' },
  { key: 'separatesBrandCampaign', label: '品牌字（店名）和一般字分開活動投' },
  { key: 'hasGeoTargeting', label: '廣告有限定在實際服務範圍地區' },
  { key: 'hasAdSchedule', label: '有依營業時間設定投放時段' },
  { key: 'landingPageMatched', label: '廣告點進去的頁面跟廣告承諾一致（不是全丟首頁）' },
];

export default function AdWasteHero({ onSubmit }: Props) {
  const [industry, setIndustry] = useState('');
  const [budget, setBudget] = useState<BudgetLevel | ''>('');
  const [manager, setManager] = useState<ManagerType | ''>('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  function toggle(key: string) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!industry) {
      setError('請選擇你的行業別');
      return;
    }
    if (!budget) {
      setError('請選擇每月廣告預算區間');
      return;
    }
    if (!manager) {
      setError('請選擇目前誰在管理廣告');
      return;
    }
    setError('');
    onSubmit({
      industry,
      budget,
      manager,
      status: {
        hasNegativeKeywords: !!checks.hasNegativeKeywords,
        hasConversionTracking: !!checks.hasConversionTracking,
        checksSearchTerms: !!checks.checksSearchTerms,
        separatesBrandCampaign: !!checks.separatesBrandCampaign,
        hasGeoTargeting: !!checks.hasGeoTargeting,
        hasAdSchedule: !!checks.hasAdSchedule,
        landingPageMatched: !!checks.landingPageMatched,
      },
    });
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E1F5EE] border border-[#1D9E75]/30 mb-5">
            <TrendingDown className="w-7 h-7 text-[#1D9E75]" aria-hidden />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            免費 · 不用登入 · 不碰你的廣告帳戶
          </div>

          <h1 className="text-[30px] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            你的 Google 廣告，
            <br className="hidden sm:block" />
            <span className="text-[#1D9E75]">每月悄悄漏掉多少錢？</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
            選預算區間、勾 7 個現況，30 秒估出你的每月浪費金額區間，
            和最該先堵的漏錢原因。全部在瀏覽器裡算，不抓帳戶資料。
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-[#1D9E75]" aria-hidden /> 30 秒完成
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#1D9E75]" aria-hidden /> 金額區間估算
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1D9E75]" aria-hidden /> 不存任何內容
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="ad-waste-industry" className="text-sm font-semibold text-slate-800">
                行業別 <span className="text-red-500">*</span>
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="ad-waste-industry" className="w-full">
                  <SelectValue placeholder="選擇你的行業" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_GROUPS.map((g) => (
                    <SelectGroup key={g.label}>
                      <SelectLabel>{g.label}</SelectLabel>
                      {g.items.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-waste-budget" className="text-sm font-semibold text-slate-800">
                每月廣告預算 <span className="text-red-500">*</span>
              </Label>
              <Select value={budget} onValueChange={(v) => setBudget(v as BudgetLevel)}>
                <SelectTrigger id="ad-waste-budget" className="w-full">
                  <SelectValue placeholder="選擇預算區間" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_LEVELS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad-waste-manager" className="text-sm font-semibold text-slate-800">
              目前誰在管理廣告 <span className="text-red-500">*</span>
            </Label>
            <Select value={manager} onValueChange={(v) => setManager(v as ManagerType)}>
              <SelectTrigger id="ad-waste-manager" className="w-full">
                <SelectValue placeholder="選擇管理方式" />
              </SelectTrigger>
              <SelectContent>
                {MANAGER_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              帳戶現況（做到的才勾，不確定就不勾）
            </p>
            <div className="grid gap-2.5">
              {BOOLEAN_CHECKS.map((c) => {
                const on = !!checks[c.key];
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggle(c.key)}
                    aria-pressed={on}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      on
                        ? 'border-[#1D9E75]/50 bg-[#E1F5EE]/60'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on
                          ? 'border-[#1D9E75] bg-[#1D9E75] text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                      aria-hidden
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-slate-700 leading-snug">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-[#1D9E75] hover:bg-[#0F6E56] text-white"
          >
            估算我的浪費金額 →
          </Button>

          <p className="text-xs text-slate-400 text-center leading-relaxed">
            結果為依現況自評的估算區間，非實際帳戶數據。想知道實際浪費了多少，
            需要進帳戶做完整健檢。
          </p>
        </form>
      </div>
    </section>
  );
}
