'use client';

import { Link2, QrCode, Star } from 'lucide-react';

/** Hero 視覺：URL → QR → Star 評論 三段轉換意象 */
export default function ReviewLinkIllustration() {
  return (
    <div
      className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px] mx-auto h-52 sm:h-60 md:h-72 mb-8 md:mb-12"
      role="img"
      aria-label="評論連結轉 QR Code 再得到星等示意"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 rounded-full bg-emerald-50/60 blur-xl" />
      </div>

      {/* 中央 QR 模擬卡 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 sm:w-52 md:w-60 bg-white rounded-2xl shadow-xl ring-1 ring-emerald-200 p-5 flex flex-col items-center gap-3">
        {/* QR 假圖（用 grid pattern 模擬） */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 49 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                [0, 1, 2, 3, 4, 5, 6, 7, 14, 21, 28, 35, 42, 43, 44, 45, 46, 12, 13, 19, 20, 26, 27, 33, 34, 40, 41, 47, 48].includes(i)
                  ? 'bg-slate-900'
                  : 'bg-slate-100'
              } rounded-sm`}
            />
          ))}
        </div>
        <div className="text-[10px] font-bold text-slate-500">掃我寫評論</div>
      </div>

      {/* 左上：URL 小卡 */}
      <div className="absolute top-2 left-2 sm:left-4 bg-white rounded-xl shadow-md ring-1 ring-slate-200 px-3 py-2 -rotate-[6deg] inline-flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden />
        <span className="text-xs font-bold text-slate-700">g.page/r/...</span>
      </div>

      {/* 右上：QR 小卡 */}
      <div className="absolute top-8 right-2 sm:right-4 bg-white rounded-xl shadow-md ring-1 ring-slate-200 px-3 py-2 rotate-[5deg] inline-flex items-center gap-1.5">
        <QrCode className="w-3.5 h-3.5 text-violet-600" aria-hidden />
        <span className="text-xs font-bold text-slate-700">QR PNG</span>
      </div>

      {/* 下方：5 星評論 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-md ring-1 ring-amber-200 px-3 py-2 rotate-[-2deg] inline-flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden />
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden />
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden />
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden />
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden />
      </div>

      {/* 飄浮裝飾點 */}
      <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60 hidden sm:block" />
      <div className="absolute bottom-12 left-10 w-1 h-1 rounded-full bg-emerald-500 opacity-70 hidden sm:block" />
    </div>
  );
}
