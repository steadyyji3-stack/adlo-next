'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import CompetitorRadar from './CompetitorRadar';
import {
  DIMENSION_LABELS,
  type CompetitorResult,
  type DimensionScores,
} from './mock-data';

interface Props {
  storeName: string;
  result: CompetitorResult;
  onReset: () => void;
}

function ScoreCell({
  value,
  best,
  isYou,
}: {
  value: number;
  best: number;
  isYou: boolean;
}) {
  const isBest = value === best;
  return (
    <div
      className={`text-center px-2 py-2 rounded-md font-bold text-sm ${
        isYou
          ? 'bg-[#1D9E75] text-white'
          : isBest
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-50 text-slate-600'
      }`}
    >
      {value}
    </div>
  );
}

export default function CompetitorResults({ storeName, result, onReset }: Props) {
  const { you, competitors, insight } = result;
  const allStores = [you, ...competitors];

  return (
    <section className="bg-slate-50 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        {/* Header */}
        <header className="mb-10 md:mb-14 text-center">
          <Badge className="bg-[#1D9E75] text-white border-0 mb-4">完成 ✓</Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight">
            <span className="text-[#1D9E75]">{storeName}</span> vs 同區 3 家
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {insight}
          </p>
        </header>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 mb-8">
          <CompetitorRadar you={you} competitors={competitors} />
        </div>

        {/* 你的優劣勢 */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-emerald-700" aria-hidden />
              <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">
                你的強項
              </p>
            </div>
            <p className="text-lg font-extrabold text-slate-900 mb-1">{you.highlight}</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              這項你做得比同區三家都好。穩住，繼續加大這個優勢就是你的差異化。
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-rose-700" aria-hidden />
              <p className="text-xs font-extrabold text-rose-700 uppercase tracking-widest">
                該補的破口
              </p>
            </div>
            <p className="text-lg font-extrabold text-slate-900 mb-1">{you.weakness}</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              這項你最弱，且對手有人做得比你好。先補這項，分數能跳最快。
            </p>
          </div>
        </div>

        {/* 詳細表格 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1D9E75]" aria-hidden />
              六維度分項對照
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="inline-block w-3 h-3 rounded bg-[#1D9E75] mr-1 align-middle" /> 你的店
              <span className="ml-3 inline-block w-3 h-3 rounded bg-amber-50 border border-amber-200 mr-1 align-middle" /> 同區最高分
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left p-3 md:p-4 font-bold text-slate-700">維度</th>
                  {allStores.map((s) => (
                    <th
                      key={s.storeName}
                      className={`p-3 md:p-4 font-bold ${
                        s.isYou ? 'text-[#1D9E75]' : 'text-slate-700'
                      }`}
                    >
                      <div className="text-xs">{s.storeName}</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                        總分 {s.overall}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMENSION_LABELS.map((d) => {
                  const values = allStores.map((s) => s.dimensions[d.key as keyof DimensionScores]);
                  const best = Math.max(...values);
                  return (
                    <tr key={d.key} className="border-b border-slate-50 last:border-b-0">
                      <td className="p-3 md:p-4 font-semibold text-slate-700">{d.label}</td>
                      {allStores.map((s, idx) => (
                        <td key={s.storeName} className="p-2 md:p-3">
                          <ScoreCell value={values[idx]} best={best} isYou={s.isYou} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset CTA */}
        <div className="text-center mb-12">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="text-sm"
            data-gtm-event="competitor_reset"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" aria-hidden />
            換一家店再比一次
          </Button>
        </div>

        {/* 底部三推薦 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/check"
            aria-label="相關工具：先測你自己的 GBP 分數"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="competitor_to_check"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 相關工具</div>
            <div className="font-bold text-slate-900 mb-1">先測你自己幾分</div>
            <div className="text-xs text-slate-600 mb-3">30 秒看你家 GBP 六維度健診</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              GBP 健診 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/tools/post-writer"
            aria-label="相關工具：補回最弱維度的貼文初稿"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="competitor_to_post_writer"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 補弱項</div>
            <div className="font-bold text-slate-900 mb-1">3 秒生 7 天貼文</div>
            <div className="text-xs text-slate-600 mb-3">分數低多半因為貼文沒更——補這個最快</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              貼文產生器 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/diagnostic"
            aria-label="預約 30 分鐘深度診斷"
            className="group bg-white rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="competitor_to_diagnostic"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 想要專人協助</div>
            <div className="font-bold text-slate-900 mb-1">預約深度診斷</div>
            <div className="text-xs text-slate-600 mb-3">直接看你的 GBP + 對手，給你客製攻防策略</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              免費預約 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
