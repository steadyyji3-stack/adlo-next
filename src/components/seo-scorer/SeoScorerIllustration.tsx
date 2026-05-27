'use client';

import { FileCheck2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

/** Hero 視覺：報告卡 + 三個 check 狀態 */
export default function SeoScorerIllustration() {
  return (
    <div
      className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px] mx-auto h-52 sm:h-60 md:h-72 mb-8 md:mb-12"
      role="img"
      aria-label="SEO 文章計分報告示意"
    >
      {/* 背景柔光圓 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 rounded-full bg-emerald-50/60 blur-xl" />
      </div>

      {/* 中央報告卡 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 sm:w-64 md:w-72 bg-white rounded-2xl shadow-xl ring-1 ring-emerald-200 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <FileCheck2 className="w-4 h-4 text-emerald-600" aria-hidden />
            SEO 報告
          </span>
          <span className="text-2xl font-extrabold text-[#1D9E75] tabular-nums">82</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: '82%' }} />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-slate-100 rounded-full" />
          <div className="h-1.5 w-3/4 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* 三個狀態小卡（pass / warn / fail） */}
      <div className="absolute top-2 left-2 sm:left-4 bg-white rounded-xl shadow-md ring-1 ring-emerald-200 px-3 py-2 -rotate-[6deg] inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden />
        <span className="text-xs font-bold text-emerald-700">H1 OK</span>
      </div>

      <div className="absolute top-6 right-2 sm:right-4 bg-white rounded-xl shadow-md ring-1 ring-amber-200 px-3 py-2 rotate-[5deg] inline-flex items-center gap-1.5">
        <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden />
        <span className="text-xs font-bold text-amber-700">字數 偏短</span>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-md ring-1 ring-rose-200 px-3 py-2 rotate-[-2deg] inline-flex items-center gap-1.5">
        <XCircle className="w-4 h-4 text-rose-600" aria-hidden />
        <span className="text-xs font-bold text-rose-700">缺 canonical</span>
      </div>

      {/* 飄浮裝飾點 */}
      <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60 hidden sm:block" />
      <div className="absolute bottom-12 left-10 w-1 h-1 rounded-full bg-emerald-500 opacity-70 hidden sm:block" />
    </div>
  );
}
