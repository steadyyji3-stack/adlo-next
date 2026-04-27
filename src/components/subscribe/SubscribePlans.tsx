'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type PlanId = 'gbp-auto' | 'local-seo' | 'ads-managed';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceHint: string;
  tagline: string;
  highlighted?: boolean;
  features: string[];
  replaces: string;
}

const plans: Plan[] = [
  {
    id: 'gbp-auto',
    name: 'GBP Auto',
    price: 'NT$3,980',
    priceHint: '/月（含稅）',
    tagline: 'Google 商家全自動管理',
    features: [
      '每月 8 則 GBP 貼文（節慶 + 促銷 + QA + 幕後）',
      '每週追蹤 GBP 洞察數據（搜尋、通話、路線）',
      '每月照片更新 10 張（你拍、我們 curation）',
      '評論自動提醒 + 回覆文案庫',
      '每月一份 1 頁重點月報',
    ],
    replaces: '取代原 NT$8,800 基礎方案',
  },
  {
    id: 'local-seo',
    name: 'Local SEO Pack',
    price: 'NT$9,800',
    priceHint: '/月（含稅）',
    tagline: '在地流量全套：GBP + 網站 SEO + 內容',
    highlighted: true,
    features: [
      '包含 GBP Auto 全部內容',
      '每月 4 篇長尾 SEO 文章（2,000+ 字）',
      '10 組台灣在地關鍵字追蹤 + 排名報告',
      '網站技術 SEO 季度健檢 + 修正建議',
      '城市 / 區域頁優化（最多 3 個據點）',
      '每月一份 3 頁深度月報',
    ],
    replaces: '取代原 NT$18,800 Growth 方案',
  },
  {
    id: 'ads-managed',
    name: 'Ads Managed',
    price: 'NT$5,000',
    priceHint: '+ 廣告費 15% 服務費',
    tagline: 'Google + Meta 廣告全代管',
    features: [
      'Google Ads 搜尋 / 在地 / 購物全帳戶代管',
      'Meta Ads FB/IG 廣告代操',
      '週報 + 月報，素材優化建議',
      '著陸頁追蹤碼 + 轉換設定',
      '廣告預算建議最低 NT$15,000/月',
      '可與 Local SEO Pack 疊加',
    ],
    replaces: '取代原 NT$32,800 代操方案',
  },
];

export default function SubscribePlans() {
  const [selected, setSelected] = useState<PlanId>('local-seo');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  );
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan: selected,
          businessName,
          industry,
          source: '/subscribe',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.message || '登記失敗，請稍後再試');
        setState('error');
        return;
      }
      // Track conversion event
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'waitlist_signup',
          plan: selected,
        });
      }
      setState('success');
    } catch {
      setErrorMsg('網路錯誤，請稍後再試');
      setState('error');
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={`relative text-left bg-white border-2 rounded-2xl p-6 flex flex-col transition-all ${
                  isSelected
                    ? 'border-[#1D9E75] shadow-lg scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-300'
                } ${plan.highlighted ? 'md:scale-[1.02]' : ''}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white border-0 text-[10px] font-extrabold tracking-wider px-3">
                    主推方案
                  </Badge>
                )}
                <h3
                  className="text-xl font-extrabold text-slate-900 mb-1"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm text-[#0F6E56] font-semibold mb-4">
                  {plan.tagline}
                </p>
                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">
                    {plan.priceHint}
                  </span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-700 leading-relaxed flex gap-2"
                    >
                      <Check className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                  {plan.replaces}
                </div>
                <div
                  className={`mt-4 text-center py-2 rounded-lg text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-[#1D9E75] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isSelected ? '✓ 已選擇這個方案' : '選擇此方案'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Waitlist form */}
        <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-7 sm:p-9">
          {state === 'success' ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#1D9E75]" />
              </div>
              <h3
                className="text-xl font-extrabold text-slate-900 mb-2"
                style={{ fontFamily: 'var(--font-manrope)' }}
              >
                登記成功！
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                開台前一週我們會寄信通知你，
                <br />
                且直接鎖定首月 6 折優惠。
              </p>
              <p className="text-slate-500 text-xs mt-4">
                想先用免費工具？到{' '}
                <a
                  href="/tools"
                  className="text-[#1D9E75] font-bold underline underline-offset-4"
                >
                  /tools
                </a>{' '}
                試試看
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-5">
                <h3
                  className="text-lg font-extrabold text-slate-900 mb-1"
                  style={{ fontFamily: 'var(--font-manrope)' }}
                >
                  登記開台 Waitlist
                </h3>
                <p className="text-sm text-slate-500">
                  60 天後正式開台 · 首月 6 折 · 可隨時取消
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="你的 email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    店家 / 品牌名稱
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="例：台北小吃"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    行業
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="例：餐飲 / 美業"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 text-sm text-slate-600 border border-slate-200">
                已選擇方案：
                <span className="font-bold text-slate-900 ml-1">
                  {plans.find((p) => p.id === selected)?.name}
                </span>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full cta-gradient text-white hover:opacity-90 h-11 text-base font-bold shadow-md"
                data-gtm-event="subscribe_waitlist_submit"
              >
                {state === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登記中...
                  </>
                ) : (
                  '登記 Waitlist，鎖定首月 6 折'
                )}
              </Button>

              <p className="text-xs text-slate-400 text-center">
                登記即同意我們之後用 email 通知你開台與使用 adlo 的隱私政策
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
