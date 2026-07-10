'use client';

import { TrendingUp, TrendingDown, Minus, History } from 'lucide-react';
import type { CheckSnapshot } from '@/lib/check-history';

interface Props {
  history: CheckSnapshot[];
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 迷你 sparkline：把分數陣列畫成折線。 */
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const W = 240;
  const H = 56;
  const pad = 6;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = Math.max(1, max - min);
  const stepX = (W - pad * 2) / (scores.length - 1);
  const pts = scores.map((s, i) => {
    const x = pad + i * stepX;
    const y = pad + (H - pad * 2) * (1 - (s - min) / range);
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lastX, lastY] = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible" role="img" aria-label="分數趨勢折線">
      <path d={path} fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="4" fill="#1D9E75" />
    </svg>
  );
}

export default function CheckHistory({ history }: Props) {
  if (history.length === 0) return null;

  // 第一次健檢 —— 鼓勵下次回來看變化
  if (history.length === 1) {
    return (
      <section className="px-6 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-emerald-50/60 ring-1 ring-emerald-200 p-5 flex items-start gap-3">
            <History className="size-5 text-emerald-700 mt-0.5 shrink-0" aria-hidden />
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">這是第一次健檢，已幫你存起來。</strong>
              下次回來查同一間店，會顯示分數變化曲線——把這頁加到書籤，過幾週再來看進步。
              <span className="text-slate-500">（紀錄只存你的瀏覽器，不上傳。）</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const prev = history[history.length - 2];
  const curr = history[history.length - 1];
  const delta = curr.score - prev.score;
  const scores = history.map((h) => h.score);

  const tone =
    delta > 0
      ? { Icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', label: `+${delta}` }
      : delta < 0
      ? { Icon: TrendingDown, color: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200', label: `${delta}` }
      : { Icon: Minus, color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200', label: '持平' };

  const { Icon } = tone;

  return (
    <section className="px-6 pb-4">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase mb-1">分數變化</p>
              <div className="flex items-baseline gap-3">
                <span className="text-slate-400 text-lg tabular-nums">{prev.score}</span>
                <span className="text-slate-300" aria-hidden>→</span>
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{curr.score}</span>
                <span className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ring-1 ${tone.bg} ${tone.ring} ${tone.color}`}>
                  <Icon className="size-3.5" aria-hidden />
                  {tone.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                上次 {fmtDate(prev.at)} · 這次 {fmtDate(curr.at)} · 共 {history.length} 次紀錄
              </p>
            </div>

            <div className="flex flex-col items-end">
              <Sparkline scores={scores} />
              <span className="text-[11px] text-slate-400 mt-1">最近 {scores.length} 次趨勢</span>
            </div>
          </div>

          {delta > 0 && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              分數上升了 —— 持續做對的事，這就是會複利的在地地基。
            </p>
          )}
          {delta < 0 && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              這次掉了一點。看看下方哪一項分數變低，先補那個。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
