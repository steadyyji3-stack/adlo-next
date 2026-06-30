'use client';

import Link from 'next/link';
import { RotateCcw, ArrowRight, TrendingUp, AlertTriangle, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdBudgetInput, AdBudgetResult, AdVerdict } from '@/lib/ad-budget';

interface Props {
  input: AdBudgetInput;
  result: AdBudgetResult;
  onReset: () => void;
}

const nt = (n: number) => `NT$${n.toLocaleString('en-US')}`;

const VERDICT_META: Record<
  AdVerdict,
  { label: string; tone: string; icon: typeof TrendingUp; headline: string }
> = {
  profitable: {
    label: '有空間，可以小額測試',
    tone: 'bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30',
    icon: TrendingUp,
    headline: '以這組數字，投廣告有機會賺',
  },
  marginal: {
    label: '勉強打平，空間很薄',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    headline: '幾乎打平——一點風吹草動就會虧',
  },
  loss: {
    label: '以這組數字會虧',
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: MinusCircle,
    headline: '以這組數字，每點一次就在賠',
  },
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs text-slate-500 mb-1 leading-tight">{label}</div>
      <div className="text-xl font-extrabold text-slate-900 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-1 leading-tight">{sub}</div>}
    </div>
  );
}

export default function AdBudgetResults({ input, result, onReset }: Props) {
  const meta = VERDICT_META[result.verdict];
  const Icon = meta.icon;
  const gap = result.marginPerClick; // breakEvenCpc − cpc

  return (
    <section className="bg-gradient-to-b from-emerald-50/60 via-white to-white py-14 md:py-20">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        {/* verdict */}
        <div className={`rounded-2xl border p-6 mb-8 ${meta.tone}`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2">
            <Icon className="w-4 h-4" aria-hidden /> {meta.label}
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold mb-2">{meta.headline}</h2>
          <p className="text-sm leading-relaxed">
            你每次點擊最多能付 <strong>{nt(result.breakEvenCpc)}</strong>，現在實付{' '}
            <strong>{nt(input.cpc)}</strong>——
            {gap >= 0
              ? `每次點擊還有約 ${nt(gap)} 的緩衝。`
              : `每次點擊大約倒貼 ${nt(Math.abs(gap))}。`}
          </p>
        </div>

        {/* 核心數字 */}
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">你的損益兩平點</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="每次點擊最多能付（損益兩平 CPC）" value={nt(result.breakEvenCpc)} sub={`你實付 ${nt(input.cpc)}`} />
          <Stat label="每筆成交最多花（損益兩平 CPA）" value={nt(result.breakEvenCpa)} sub="= 每筆成交毛利" />
          <Stat label="損益兩平 ROAS（營收 ÷ 廣告費）" value={`${result.breakEvenRoas}×`} sub="低於這個就虧" />
          <Stat label="這個 CPC 下、不虧所需轉換率" value={`${result.requiredConversionRatePct}%`} sub={`你填 ${input.conversionRatePct}%`} />
        </div>

        {/* 每月預估 */}
        {result.projection && (
          <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              以每月 {nt(input.monthlyBudget ?? 0)} 預算估算
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div><div className="text-lg font-extrabold text-slate-900 tabular-nums">{result.projection.clicks.toLocaleString('en-US')}</div><div className="text-[11px] text-slate-500">點擊</div></div>
              <div><div className="text-lg font-extrabold text-slate-900 tabular-nums">{result.projection.conversions}</div><div className="text-[11px] text-slate-500">成交</div></div>
              <div><div className="text-lg font-extrabold text-slate-900 tabular-nums">{nt(result.projection.revenue)}</div><div className="text-[11px] text-slate-500">營收</div></div>
              <div>
                <div className={`text-lg font-extrabold tabular-nums ${result.projection.netProfit >= 0 ? 'text-[#1D9E75]' : 'text-rose-600'}`}>
                  {result.projection.netProfit >= 0 ? '+' : '−'}{nt(Math.abs(result.projection.netProfit))}
                </div>
                <div className="text-[11px] text-slate-500">淨利（扣廣告）</div>
              </div>
            </div>
          </div>
        )}

        {/* 下一步建議 */}
        <div className="rounded-2xl bg-[#E1F5EE] border border-[#1D9E75]/20 p-6">
          <h3 className="text-sm font-bold text-[#0F6E56] mb-2">下一步</h3>
          {result.verdict === 'loss' ? (
            <>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                這組數字下，與其燒廣告，不如先把<strong>免費的 Google 商家</strong>做起來——同樣的客流不用每次付點擊費。先看你家現在幾分、缺什麼。
              </p>
              <div className="flex flex-wrap gap-3">
                <CtaLink href="/check" label="先做 GBP 健診" />
                <CtaLink href="/tools/map-visibility" label="拿地圖優化清單" />
              </div>
            </>
          ) : result.verdict === 'marginal' ? (
            <>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                空間很薄，投之前先把字選準、看清楚對手，別把預算花在打不贏的關鍵字上。
              </p>
              <div className="flex flex-wrap gap-3">
                <CtaLink href="/tools/keyword" label="檢查關鍵字難度" />
                <CtaLink href="/tools/competitor" label="看競爭對手雷達" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                有空間，但別一次梭哈。先選對字、小額測一兩週，拿真實數字回來再調這裡的轉換率重算。
              </p>
              <div className="flex flex-wrap gap-3">
                <CtaLink href="/tools/keyword" label="檢查關鍵字難度" />
                <CtaLink href="/tools/competitor" label="看競爭對手雷達" />
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400 leading-relaxed text-center">
          試算為概估，假設轉換率穩定、不含品牌效益與回購。實際投放請以小額測試的真實數據為準。
        </p>

        <div className="mt-8 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="font-semibold border-slate-300 hover:border-[#1D9E75] hover:text-[#1D9E75]"
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden /> 換組數字再算
          </Button>
        </div>
      </div>
    </section>
  );
}

function CtaLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] hover:text-[#0F6E56] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
    >
      {label} <ArrowRight className="w-3.5 h-3.5" aria-hidden />
    </Link>
  );
}
