'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STAGES = [
  { id: 0, text: '正在讀取你的商家資料', duration: 1500 },
  { id: 1, text: '比對同地區同業表現', duration: 1500 },
  { id: 2, text: '整理你的健檢報告', duration: 1200 },
];

export default function CheckLoading() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STAGES.length) return;
    const timer = setTimeout(() => {
      setCurrent((c) => c + 1);
    }, STAGES[current].duration);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-100 mb-4">
            <Loader2 className="size-8 text-[#1D9E75] animate-spin" aria-hidden />
          </div>
          <p className="text-sm text-slate-500 tracking-wide">稍等一下，正在幫你看</p>
        </div>

        <ol className="space-y-4">
          {STAGES.map((stage, idx) => {
            const done = idx < current;
            const active = idx === current;
            return (
              <li
                key={stage.id}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                  done
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                    : active
                    ? 'border-emerald-300 bg-white text-slate-900 shadow-sm shadow-emerald-100'
                    : 'border-slate-200 bg-white/40 text-slate-400'
                }`}
              >
                <span className="size-6 shrink-0 flex items-center justify-center">
                  {done ? (
                    <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
                  ) : active ? (
                    <Loader2 className="size-5 text-[#1D9E75] animate-spin" aria-hidden />
                  ) : (
                    <span className="size-2 rounded-full bg-slate-300" aria-hidden />
                  )}
                </span>
                <span className="text-sm md:text-base font-medium">
                  {stage.text}
                  {active && <span className="animate-pulse">⋯</span>}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="text-center text-xs text-slate-400 mt-10">
          資料來源：Google 公開商家資訊
        </p>
      </div>
    </section>
  );
}
