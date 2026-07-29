'use client';

import { useState } from 'react';
import { Check, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * ⚠️ 這個 id 必須與 Track B 收斂後的 Stripe PLANS 一致。
 * Track B 尚未把 src/lib/stripe.ts 的 starter/growth/dominate 收斂為單一方案，
 * 在那之前 checkout 會失敗 —— 本頁不可在 Stripe 設定完成前上 production。
 */
const PLAN_ID = 'workspace';

type Billing = 'monthly' | 'yearly';

const PRICE = {
  monthlyPerMonth: 2980,
  monthlyPerYear: 2980 * 12, // 35,760
  yearlyFirstYear: 17880, // 29,800 × 0.6
  yearlyStandard: 29800,
} as const;

const nt = (n: number) => `NT$${n.toLocaleString('zh-TW')}`;

/** 只列目前已在 main、可驗證的能力。未合併或未過 E2E 的功能一律放到 upcoming。 */
const includedFeatures = [
  '每週一件最值得做的成長任務，含 10 分鐘簡化版與逐步教學',
  '完成後留下前後結果，系統依觀察決定下一週要重複、調整或換方向',
  '5 分鐘店家建檔，不需要交出 Google 帳號',
  '每週一 Email 提醒，告訴你這週該做什麼',
  'Email 連結登入，不用記密碼',
  '付款方式與取消都能自己在會員中心處理',
];

/** 尚未上線的能力，明確標示，不得寫成現有功能。 */
const upcomingFeatures = [
  '評論回覆工作區：貼上評論取得三種台灣口吻草稿，可編輯後自行發布',
  '網站修正包：Title / Meta / H1 與 FAQ 建議，可交給網站商執行',
  '成果時間軸：把每次健檢分數與完成紀錄放在同一條軸上比較',
];

export default function SubscribePlans() {
  const [billing, setBilling] = useState<Billing>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isYearly = billing === 'yearly';

  async function handleSubscribe() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: PLAN_ID, billing }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError('目前無法開始結帳，請稍後再試或直接與我們聯絡。');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('連線發生問題，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">

        {/* 計費切換 */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1"
            role="group"
            aria-label="選擇計費週期"
          >
            {(['yearly', 'monthly'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setBilling(value)}
                aria-pressed={billing === value}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                  billing === value
                    ? 'bg-[#1D9E75] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {value === 'yearly' ? '年繳' : '月繳'}
              </button>
            ))}
          </div>
        </div>

        {/* 方案卡 */}
        <div className="rounded-2xl border-2 border-[#1D9E75]/30 bg-white shadow-sm overflow-hidden">
          <div className="bg-[#E1F5EE] px-8 py-4 text-center">
            <span className="text-sm font-bold text-[#0F6E56]">
              adlo 店家成長訂閱
            </span>
          </div>

          <div className="px-8 py-10 text-center border-b border-slate-100">
            {isYearly ? (
              <>
                <Badge className="bg-[#1D9E75] text-white border-transparent text-xs font-bold mb-4">
                  首年 6 折
                </Badge>
                <div className="flex items-baseline justify-center gap-2">
                  <span
                    className="text-5xl font-extrabold text-slate-900"
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    {nt(PRICE.yearlyFirstYear)}
                  </span>
                  <span className="text-slate-500 text-sm">/ 首年</span>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  原價 <span className="line-through">{nt(PRICE.yearlyStandard)}</span>
                  <span className="mx-1.5">·</span>
                  第二年起 {nt(PRICE.yearlyStandard)}/年
                </p>
                <p className="text-sm font-bold text-[#0F6E56] mt-2">
                  比月繳一年省 {nt(PRICE.monthlyPerYear - PRICE.yearlyFirstYear)}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-2">
                  <span
                    className="text-5xl font-extrabold text-slate-900"
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    {nt(PRICE.monthlyPerMonth)}
                  </span>
                  <span className="text-slate-500 text-sm">/ 月</span>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  一年約 {nt(PRICE.monthlyPerYear)}
                  <span className="mx-1.5">·</span>
                  想省一半可改年繳
                </p>
              </>
            )}

            <div className="mt-8">
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full sm:w-auto bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-bold px-10 py-6 text-base"
                data-gtm-event="checkout_start"
                data-gtm-plan={PLAN_ID}
                data-gtm-billing={billing}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    處理中…
                  </>
                ) : (
                  '開始 30 天免費試用'
                )}
              </Button>
              <p className="text-xs text-slate-500 mt-3">
                前 30 天不收費，試用期內取消不會產生任何費用。
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-3" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* 包含什麼 */}
          <div className="px-8 py-8">
            <p className="text-sm font-bold text-slate-900 mb-4">訂閱包含</p>
            <ul className="space-y-3">
              {includedFeatures.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                  <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-1" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm font-bold text-slate-900 mt-8 mb-4">即將推出</p>
            <ul className="space-y-3">
              {upcomingFeatures.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-slate-500 leading-relaxed">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-1" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              「即將推出」代表功能尚未開放，訂閱後會在完成時自動加入，不另外收費。
            </p>
          </div>
        </div>

        {/* 邊界說明 —— 誠實聲明，避免與服務條款衝突 */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-5">
          <p className="text-sm font-bold text-slate-900 mb-2">這個訂閱不做什麼</p>
          <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
            <li>· 不會取得你的 Google 帳號授權，也不會自動發布任何內容</li>
            <li>· 不代操 Google 或 Meta 廣告</li>
            <li>· 不保證特定排名、流量或營收 —— 成效受演算法與市場競爭影響</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
