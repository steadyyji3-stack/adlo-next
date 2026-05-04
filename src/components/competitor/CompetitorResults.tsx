'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Crown,
  AlertTriangle,
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
      className={`text-center px-2 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-1 ${
        isYou
          ? 'bg-[#1D9E75] text-white'
          : isBest
          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
          : 'bg-slate-50 text-slate-600'
      }`}
    >
      {isBest && !isYou && (
        <Crown className="w-3 h-3" aria-label="同區最高分" />
      )}
      {value}
    </div>
  );
}

export default function CompetitorResults({ storeName, result, onReset }: Props) {
  const { you, competitors, insight, yourStoreInResults, inputCity } = result;
  const allStores = [you, ...competitors];

  // 對手平均分（給 header 對比卡用）
  const compAvg = competitors.length
    ? Math.round(competitors.reduce((s, c) => s + c.overall, 0) / competitors.length)
    : 0;
  const diff = you.overall - compAvg;
  const leadingOrTrailing = diff > 0 ? '領先' : diff < 0 ? '落後' : '持平';
  const diffColor = diff > 5 ? 'text-emerald-600' : diff < -5 ? 'text-rose-600' : 'text-slate-600';

  return (
    <section className="bg-slate-50 py-16 sm:py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        {/* Header — 大號儀式感 */}
        <header className="mb-10 md:mb-14 text-center">
          <Badge className="bg-[#1D9E75] text-white border-0 mb-5 px-3 py-1 text-xs font-extrabold tracking-wide">
            ✓ 比較完成
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            <span className="text-[#1D9E75] break-all">{storeName}</span>
            <br className="sm:hidden" />
            <span className="text-slate-400 mx-2 font-bold">vs</span>
            同區 {competitors.length} 家
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {insight}
          </p>
          {competitors.length === 0 && (
            <p className="mt-4 text-xs text-amber-700 bg-amber-50 inline-block px-3 py-1.5 rounded-full">
              ⚠️ 沒找到對手——關鍵字可能太冷門，試試把字放寬
            </p>
          )}
        </header>

        {/* 大號分數對比卡（你 vs 同區平均） */}
        {competitors.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-[#1D9E75]/30 rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">
                你的店
              </p>
              <p className="text-3xl sm:text-5xl font-extrabold text-[#1D9E75] leading-none mb-1">
                {you.overall}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">/ 100 分</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-center flex flex-col justify-center">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                差距
              </p>
              <p className={`text-2xl sm:text-3xl font-extrabold leading-none mb-1 ${diffColor}`}>
                {diff > 0 ? '+' : ''}{diff}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">{leadingOrTrailing}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                同區平均
              </p>
              <p className="text-3xl sm:text-5xl font-extrabold text-slate-700 leading-none mb-1">
                {compAvg}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">/ 100 分</p>
            </div>
          </div>
        )}

        {/* 你的店不在搜尋結果裡 — 透明告知 */}
        {yourStoreInResults === false && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 md:p-6">
            <div className="flex gap-3">
              <AlertTriangle
                className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                aria-hidden
              />
              <div>
                <p className="text-sm font-extrabold text-amber-900 mb-1.5">
                  注意：你的店不在「{inputCity}」的「{result.query?.split(' ')[0] ?? '搜尋'}」前 10 名
                </p>
                <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                  我們在 Google 地圖直接搜店名找到「
                  <strong>{you.storeName}</strong>」
                  {you.location ? `（位於 ${you.location}）` : ''}。
                  比較對象是<strong>「{inputCity}」當地同類前 3 家</strong>——
                  如果你的目標市場是 {inputCity}，這個比較就是有意義的（你想打進的對手）。
                  如果你只想看自己所在區的對手，請回到上一頁改選你店家所在的城市重跑。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Radar chart */}
        <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-6 md:p-10 mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
            六維度雷達圖
          </p>
          <CompetitorRadar you={you} competitors={competitors} />
        </div>

        {/* 你的優劣勢 */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl p-6 md:p-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Trophy className="w-5 h-5" aria-hidden />
              </div>
              <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">
                你的強項
              </p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">
              {you.highlight}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              這項你做得比同區都好。穩住，繼續加大這個優勢就是你的差異化。
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-white border-2 border-rose-200 rounded-2xl p-6 md:p-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Target className="w-5 h-5" aria-hidden />
              </div>
              <p className="text-xs font-extrabold text-rose-700 uppercase tracking-widest">
                該補的破口
              </p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">
              {you.weakness}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              這項你最弱，且對手有人做得比你好。先補這項，分數能跳最快。
            </p>
          </div>
        </div>

        {/* 詳細表格 */}
        <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="p-5 md:p-7 border-b border-slate-100">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#1D9E75]" aria-hidden />
              六維度分項對照
            </h3>
            <p className="text-xs text-slate-500">
              <span className="inline-block w-3 h-3 rounded bg-[#1D9E75] mr-1 align-middle" /> 你的店
              <span className="ml-3 inline-flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-700" />
                <span className="text-amber-700">同區最高分</span>
              </span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left p-4 md:p-5 font-bold text-slate-700 sticky left-0 bg-slate-50/95 backdrop-blur-sm w-24 text-xs uppercase tracking-widest">
                    維度
                  </th>
                  {allStores.map((s) => (
                    <th
                      key={s.storeName}
                      className={`p-4 md:p-5 font-bold align-top ${
                        s.isYou ? 'text-[#1D9E75]' : 'text-slate-700'
                      }`}
                    >
                      <div
                        className="text-xs md:text-sm leading-snug line-clamp-2"
                        title={s.storeName}
                      >
                        {s.storeName}
                      </div>
                      <div className="text-[10px] md:text-xs font-normal text-slate-400 mt-1">
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
                    <tr key={d.key} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 md:p-5 font-semibold text-slate-800 sticky left-0 bg-white text-sm">
                        {d.label}
                      </td>
                      {allStores.map((s, idx) => (
                        <td key={s.storeName} className="p-3 md:p-4">
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
