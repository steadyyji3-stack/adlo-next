'use client';

import { Sparkles, Calendar } from 'lucide-react';

/**
 * 3-stacked post-card illustration.
 * 純 Tailwind/SVG，無外部圖檔依賴。配合 adlo 主色 #1D9E75 + slate 系。
 *
 * 2026-04-28 放大版：
 * - 容器寬：280 → 340 (mobile) / 420 (sm) / 480 (md+)
 * - 卡片：w-48 h-28 → w-60 h-40 (mobile) / w-72 h-44 (sm) / w-80 h-48 (md+)
 * - 內部間距、字級、rounded radius 同步放大
 */
export default function PostWriterIllustration() {
  return (
    <div
      className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] mx-auto h-44 sm:h-52 md:h-60 mb-8 md:mb-12"
      role="img"
      aria-label="一週 7 天貼文初稿堆疊示意"
    >
      {/* 後卡 */}
      <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 -rotate-[6deg] w-60 sm:w-72 md:w-80 h-36 sm:h-40 md:h-44 bg-emerald-50 rounded-3xl shadow-sm ring-1 ring-emerald-100" />

      {/* 中卡 */}
      <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 rotate-[3deg] w-60 sm:w-72 md:w-80 h-36 sm:h-40 md:h-44 bg-white rounded-3xl shadow-md ring-1 ring-slate-200" />

      {/* 前卡（內容） */}
      <div className="absolute inset-x-0 top-0 mx-auto w-60 sm:w-72 md:w-80 h-36 sm:h-40 md:h-44 bg-white rounded-3xl shadow-2xl ring-1 ring-emerald-200 p-5 sm:p-6 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold tracking-wide bg-slate-900 text-white rounded-md px-2 py-0.5">
            週一
          </span>
          <span className="text-xs font-bold bg-amber-50 text-amber-700 rounded-md px-2 py-0.5 inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" aria-hidden />
            節慶
          </span>
          <span className="ml-auto text-[10px] text-slate-400 hidden sm:inline">
            建議 09:00
          </span>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-200 rounded-full" />
          <div className="h-2 w-4/5 bg-slate-100 rounded-full" />
          <div className="h-2 w-3/5 bg-slate-100 rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 sm:hidden">建議 09:00</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D9E75]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            初稿已生成
          </span>
          <Sparkles className="w-4 h-4 text-emerald-500 sm:hidden" aria-hidden />
        </div>
      </div>

      {/* 飄浮裝飾點（更多層次） */}
      <div className="absolute top-0 right-4 sm:right-8 w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-70" />
      <div className="absolute bottom-2 left-6 sm:left-10 w-2 h-2 rounded-full bg-emerald-300 opacity-60" />
      <div className="absolute top-10 left-2 sm:left-4 w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-80" />
      <div className="absolute bottom-8 right-2 sm:right-6 w-1 h-1 rounded-full bg-emerald-400 opacity-50 hidden sm:block" />
      <div className="absolute top-20 right-1 w-1.5 h-1.5 rounded-full bg-emerald-200 opacity-60 hidden md:block" />

      {/* 「7 篇」徽章浮在右上 */}
      <div className="absolute -top-2 -right-1 sm:-right-3 bg-[#1D9E75] text-white text-xs font-extrabold rounded-full px-3 py-1.5 shadow-lg ring-2 ring-white rotate-[8deg]">
        ✨ 7 篇
      </div>
    </div>
  );
}
