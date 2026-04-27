'use client';

import { Sparkles, Calendar } from 'lucide-react';

/**
 * 3-stacked post-card illustration.
 * 純 Tailwind/SVG，無外部圖檔依賴。配合 adlo 主色 #1D9E75 + slate 系。
 */
export default function PostWriterIllustration() {
  return (
    <div
      className="relative w-full max-w-[280px] mx-auto h-36 md:h-40 mb-8 md:mb-10"
      role="img"
      aria-label="一週 7 天貼文初稿堆疊示意"
    >
      {/* 後卡 */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 -rotate-[6deg] w-48 md:w-52 h-28 md:h-32 bg-emerald-50 rounded-2xl shadow-sm ring-1 ring-emerald-100" />

      {/* 中卡 */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 rotate-[3deg] w-48 md:w-52 h-28 md:h-32 bg-white rounded-2xl shadow-md ring-1 ring-slate-200" />

      {/* 前卡（內容） */}
      <div className="absolute inset-x-0 top-0 mx-auto w-48 md:w-52 h-28 md:h-32 bg-white rounded-2xl shadow-xl ring-1 ring-emerald-200 p-3.5 flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-extrabold tracking-wide bg-slate-900 text-white rounded px-1.5 py-0.5">
            週一
          </span>
          <span className="text-[9px] font-bold bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 inline-flex items-center gap-1">
            <Calendar className="w-2 h-2" aria-hidden />
            節慶
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-slate-200 rounded-full" />
          <div className="h-1.5 w-4/5 bg-slate-100 rounded-full" />
          <div className="h-1.5 w-3/5 bg-slate-100 rounded-full" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-400">建議 09:00</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" aria-hidden />
        </div>
      </div>

      {/* 飄浮裝飾點 */}
      <div className="absolute top-0 right-4 w-2 h-2 rounded-full bg-emerald-400 opacity-70" />
      <div className="absolute bottom-2 left-6 w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-60" />
      <div className="absolute top-8 left-2 w-1 h-1 rounded-full bg-emerald-500 opacity-80" />
    </div>
  );
}
