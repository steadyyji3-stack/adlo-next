'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  TrendingDown,
  Wrench,
  Clock3,
  Info,
} from 'lucide-react';
import type { AdWasteResult, LeakItem } from '@/lib/ad-waste';

interface Props {
  industry: string;
  result: AdWasteResult;
  onReset: () => void;
}

const GRADE_STYLES: Record<AdWasteResult['grade'], string> = {
  A: 'bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30',
  B: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  C: 'bg-amber-50 text-amber-700 border-amber-200',
  D: 'bg-orange-50 text-orange-700 border-orange-200',
  E: 'bg-red-50 text-red-700 border-red-200',
};

function nt(n: number): string {
  return `NT$${n.toLocaleString('zh-TW')}`;
}

function LeakCard({ leak, rank }: { leak: LeakItem; rank?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-bold text-slate-900 leading-snug">
          {rank ? `${rank}. ` : ''}
          {leak.title}
        </h4>
        <span className="shrink-0 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-600">
          約 {leak.pctLo}–{leak.pctHi}%
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{leak.why}</p>
      <div className="flex items-start gap-2 rounded-lg bg-[#E1F5EE]/50 border border-[#1D9E75]/20 px-3.5 py-2.5">
        <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1D9E75]" aria-hidden />
        <p className="text-xs text-slate-700 leading-relaxed">{leak.fix}</p>
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
        <Clock3 className="h-3 w-3" aria-hidden /> 約 {leak.effortMin} 分鐘
      </p>
    </div>
  );
}

export default function AdWasteResults({ industry, result, onReset }: Props) {
  const {
    wasteLoNT,
    wasteHiNT,
    pctLo,
    pctHi,
    grade,
    gradeLabel,
    leaks,
    topLeaks,
    notes,
    allClear,
  } = result;

  return (
    <section className="bg-gradient-to-b from-emerald-50 via-white to-white py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* 估算結果卡 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center mb-8">
          <p className="text-sm text-slate-500 mb-2">
            {industry}・依你勾選的現況估算
          </p>
          {allClear ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-[#1D9E75] mx-auto mb-3" aria-hidden />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                基礎都做對了 👏
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                7 個常見漏洞你都有堵。剩下的是任何帳戶都有的自然優化空間
                （約 {pctLo}–{pctHi}%，每月約 {nt(wasteLoNT)}–{nt(wasteHiNT)}），
                這部分要靠逐字調出價和素材測試慢慢磨。
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                估計每月正在浪費
              </p>
              <p className="text-4xl md:text-5xl font-bold text-red-600 tracking-tight mb-1">
                {nt(wasteLoNT)}–{nt(wasteHiNT)}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                約佔預算 {pctLo}–{pctHi}%・一年約 {nt(wasteLoNT * 12)}–{nt(wasteHiNT * 12)}
              </p>
            </>
          )}
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${GRADE_STYLES[grade]}`}
          >
            <TrendingDown className="h-4 w-4" aria-hidden />
            {grade} 級・{gradeLabel}
          </span>
        </div>

        {!allClear && (
          <>
            {/* 本週先堵這幾個 */}
            <div className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-bold text-[#0F6E56] uppercase tracking-widest mb-4">
                本週先堵這 {topLeaks.length} 個洞
              </h3>
              <div className="space-y-3">
                {topLeaks.map((l, i) => (
                  <LeakCard key={l.id} leak={l} rank={i + 1} />
                ))}
              </div>
            </div>

            {leaks.length > topLeaks.length && (
              <>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                  其餘漏洞（依影響排序）
                </h3>
                <div className="space-y-3 mb-8">
                  {leaks
                    .filter((l) => !topLeaks.some((t) => t.id === l.id))
                    .map((l) => (
                      <LeakCard key={l.id} leak={l} />
                    ))}
                </div>
              </>
            )}
          </>
        )}

        {notes.length > 0 && (
          <div className="space-y-3 mb-8">
            {notes.map((n, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3.5"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <p className="text-sm text-slate-700 leading-relaxed">{n}</p>
              </div>
            ))}
          </div>
        )}

        {/* 估算依據 */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-4 mb-10">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-600">估算依據：</strong>
            各漏洞的浪費比例區間，來自 adlo 廣告健檢中該類問題的常見影響範圍，
            以區間呈現、加總後封頂，避免誇大。這是「自評式估算」，
            不是你帳戶的實際數據——實際金額可能更高或更低，
            要進帳戶看搜尋字詞與轉換報表才能確定。
          </p>
        </div>

        {/* 下一步 CTA */}
        <div className="bg-[#1D9E75] rounded-2xl p-8 text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            想知道「實際」浪費了多少？
          </h3>
          <p className="text-sm text-emerald-50/90 leading-relaxed max-w-md mx-auto mb-5">
            NT$1,990 的診斷包會直接進你的帳戶：逐字檢查搜尋字詞、
            列出可以直接停掉的無效關鍵字清單、附競爭對手廣告解析。
            3 個工作天交付，訂閱可全額折抵首月。
          </p>
          <Button
            asChild
            className="h-11 px-6 bg-white text-[#0F6E56] hover:bg-emerald-50 font-bold"
          >
            <Link href="/diagnostic">
              NT$1,990 完整健檢 <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {/* 相關工具 */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10 text-sm">
          <Link
            href="/tools/keyword"
            className="inline-flex items-center gap-1.5 font-semibold text-[#1D9E75] hover:text-[#0F6E56]"
          >
            查關鍵字的廣告單價 <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
          <Link
            href="/check"
            className="inline-flex items-center gap-1.5 font-semibold text-[#1D9E75] hover:text-[#0F6E56]"
          >
            順便看 GBP 幾分 <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="font-semibold border-slate-300 hover:border-[#1D9E75] hover:text-[#1D9E75]"
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden /> 重新估算
          </Button>
        </div>
      </div>
    </section>
  );
}
