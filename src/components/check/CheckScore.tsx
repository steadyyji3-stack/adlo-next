'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Store, MessageSquare, MessageCircleReply, Image as ImageIcon, Search, MapPin } from 'lucide-react';
import type { CheckResult } from './CheckFlow';

interface Props {
  result: CheckResult;
  onReset: () => void;
}

function getBand(score: number) {
  if (score >= 80) return { label: '80-100', title: '體質很好，繼續保養', desc: '少數幾個細節調整，可以衝上地區前 3。', tone: 'emerald' as const };
  if (score >= 60) return { label: '60-79', title: '有基礎，還能更好', desc: '3-5 個地方沒補齊，補完客流會明顯增加。', tone: 'emerald' as const };
  if (score >= 40) return { label: '40-59', title: '容易錯失客人', desc: '客人正在找你，但還沒看到你。', tone: 'amber' as const };
  return { label: '0-39', title: '幾乎沒被看見', desc: '現在開始優化，3 個月內能看到明顯變化。', tone: 'rose' as const };
}

const METRICS = [
  { key: 'profile', label: '商家檔案完整度', icon: Store },
  { key: 'reviews', label: '評論數量與星等', icon: MessageSquare },
  { key: 'reply', label: '店家回覆率', icon: MessageCircleReply },
  { key: 'photos', label: '照片豐富度', icon: ImageIcon },
  { key: 'keywords', label: '關鍵字命中', icon: Search },
  { key: 'local', label: '在地競爭力', icon: MapPin },
] as const;

export default function CheckScore({ result, onReset }: Props) {
  const [animScore, setAnimScore] = useState(0);
  const band = getBand(result.score);

  // 分數動畫（0 → final，約 1.2s）
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimScore(Math.round(result.score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.score]);

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (animScore / 100) * circumference;

  const ringColor = band.tone === 'emerald' ? '#1D9E75' : band.tone === 'amber' ? '#D97706' : '#E11D48';

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-2">你的商家健檢分數</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            {result.storeName} · {result.location}
          </h2>
        </div>

        {/* 分數環 + 解讀 */}
        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-center mb-14 md:mb-20">
          <div className="relative mx-auto">
            <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90" aria-hidden>
              <circle cx="110" cy="110" r="90" stroke="#E2E8F0" strokeWidth="14" fill="none" />
              <circle
                cx="110"
                cy="110"
                r="90"
                stroke={ringColor}
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-[1200ms] ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl md:text-7xl font-bold text-slate-900 tabular-nums leading-none">
                {animScore}
              </span>
              <span className="text-sm text-slate-500 mt-1">/ 100 分</span>
            </div>
          </div>

          <div>
            <Badge
              variant="outline"
              className={`mb-3 tracking-widest text-xs font-bold uppercase ${
                band.tone === 'emerald'
                  ? 'text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE]'
                  : band.tone === 'amber'
                  ? 'text-amber-800 border-amber-300/50 bg-amber-50'
                  : 'text-rose-800 border-rose-300/50 bg-rose-50'
              }`}
            >
              {band.label} 分
            </Badge>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{band.title}</h3>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-5">{band.desc}</p>
            <p className="text-sm text-slate-500">
              在 <span className="font-semibold text-slate-700">{result.location}</span> 同業中，你排在前
              <span className="font-semibold text-emerald-700"> {result.regionRankPercent}% </span>。
              最需要補的一項：
              <span className="font-semibold text-slate-900"> {result.weakestMetric}</span>。
            </p>
          </div>
        </div>

        {/* 6 項指標 */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {METRICS.map((m) => {
            const score = result.breakdown[m.key];
            const color = score >= 70 ? 'text-[#1D9E75]' : score >= 50 ? 'text-amber-600' : 'text-rose-600';
            const barColor = score >= 70 ? 'bg-[#1D9E75]' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';
            const Icon = m.icon;
            return (
              <Card key={m.key} className="border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Icon className="size-5 text-[#1D9E75]" aria-hidden />
                    </div>
                    <span className={`text-2xl font-bold tabular-nums ${color}`}>{score}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-3">{m.label}</p>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${score}%` }}
                      aria-hidden
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            onClick={onReset}
            variant="outline"
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <RotateCcw className="size-4" aria-hidden />
            查另一間店
          </Button>
        </div>
      </div>
    </section>
  );
}
