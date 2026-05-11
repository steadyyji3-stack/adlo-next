'use client';

import { Search, TrendingUp, Target } from 'lucide-react';

/** Hero 視覺：搜尋框 + 三個策略決策卡（不顯示具體數字）*/
export default function KeywordIllustration() {
  return (
    <div
      className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px] mx-auto h-44 sm:h-52 md:h-56 mb-8 md:mb-12"
      role="img"
      aria-label="關鍵字策略判斷示意：搜尋框 + 等級評估卡"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 rounded-full bg-emerald-50/60 blur-xl" />
      </div>

      {/* 中央輸入框模擬 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 md:w-64 bg-white rounded-2xl shadow-xl ring-1 ring-emerald-200 p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden />
        <div className="flex-1 space-y-1.5">
          <div className="h-1.5 w-full bg-slate-200 rounded-full" />
          <div className="h-1.5 w-2/3 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* 三個決策小卡 — 等級版（不顯示精準數字） */}
      <div className="absolute top-2 left-2 sm:left-4 bg-white rounded-xl shadow-md ring-1 ring-slate-200 px-3 py-2 -rotate-[6deg]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <TrendingUp className="w-3 h-3 text-emerald-600" aria-hidden />
          搜尋量
        </div>
        <div className="text-sm font-extrabold text-emerald-700">熱門</div>
      </div>

      <div className="absolute top-6 right-2 sm:right-4 bg-white rounded-xl shadow-md ring-1 ring-slate-200 px-3 py-2 rotate-[5deg]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" aria-hidden />
          SEO 難度
        </div>
        <div className="text-sm font-extrabold text-slate-900">
          43<span className="text-[10px] text-slate-400">/100</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-md ring-1 ring-slate-200 px-3 py-2 rotate-[-2deg]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
          <Target className="w-3 h-3 text-violet-600" aria-hidden />
          建議
        </div>
        <div className="text-sm font-extrabold text-[#1D9E75]">🔥 強推 SEO</div>
      </div>

      {/* 飄浮裝飾點 */}
      <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60 hidden sm:block" />
      <div className="absolute bottom-12 left-10 w-1 h-1 rounded-full bg-emerald-500 opacity-70 hidden sm:block" />
    </div>
  );
}
