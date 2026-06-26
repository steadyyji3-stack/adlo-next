'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw, Clock, CheckCircle2, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ActionItem, MapVisibilityResult, Priority } from '@/lib/map-visibility';

interface Props {
  city: string;
  industry: string;
  result: MapVisibilityResult;
  onReset: () => void;
}

const PRIORITY_META: Record<Priority, { label: string; badge: string }> = {
  P0: { label: '最優先 · 地圖能不能被找到', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
  P1: { label: '次優先 · 強化排名訊號', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  P2: { label: '進階 · 加分項', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function ActionCard({ action, rank }: { action: ActionItem; rank?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:border-[#1D9E75]/40 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        {rank !== undefined && (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/30 text-[#1D9E75] font-black text-sm shrink-0">
            {rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_META[action.priority].badge}`}>
              {action.priority}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" aria-hidden /> 約 {action.effortMin} 分鐘
            </span>
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 leading-snug">
            {action.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{action.why}</p>
          {action.toolHref && (
            <Link
              href={action.toolHref}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] hover:text-[#0F6E56] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              data-gtm-event="map_visibility_tool_link"
            >
              用「{action.toolName}」代勞 <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapVisibilityResults({ city, industry, result, onReset }: Props) {
  const { priorityActions, thisWeekTop3, passedCount, totalChecks } = result;
  const allClear = priorityActions.length === 0;

  return (
    <section className="bg-gradient-to-b from-emerald-50/60 via-white to-white py-14 md:py-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* 摘要 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 px-4 py-1.5 text-xs font-bold text-[#0F6E56] mb-4">
            <ListChecks className="w-3.5 h-3.5" aria-hidden />
            {city} · {industry}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            你的地圖優化清單
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            {totalChecks} 項基礎檢查，你已完成{' '}
            <strong className="text-[#1D9E75]">{passedCount}</strong> 項
            {!allClear && <>，還有 {priorityActions.length} 件可以補。</>}
          </p>
        </div>

        {allClear ? (
          <div className="bg-white border border-[#1D9E75]/30 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#1D9E75] mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-bold text-slate-900 mb-2">地圖基礎已經很完整 👏</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              你的 Google 商家檔案基礎都做到了。接下來靠「持續性」拉開差距——維持每週發文、持續收評論並回覆。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/tools/post-writer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] hover:text-[#0F6E56]">
                維持發文節奏 <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
              <Link href="/tools/review-link" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] hover:text-[#0F6E56]">
                持續收評論 <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 本週先做這 3 件 */}
            <div className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-bold text-[#0F6E56] uppercase tracking-widest mb-4">
                本週先做這 {thisWeekTop3.length} 件
              </h3>
              <div className="space-y-3">
                {thisWeekTop3.map((a, i) => (
                  <ActionCard key={a.id} action={a} rank={i + 1} />
                ))}
              </div>
            </div>

            {/* 完整清單 */}
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
              完整行動清單（依優先序）
            </h3>
            <div className="space-y-3">
              {priorityActions.map((a) => (
                <ActionCard key={a.id} action={a} />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="font-semibold border-slate-300 hover:border-[#1D9E75] hover:text-[#1D9E75]"
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden /> 重新評估
          </Button>
        </div>
      </div>
    </section>
  );
}
