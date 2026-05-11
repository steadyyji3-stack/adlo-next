'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw, Info } from 'lucide-react';
import Link from 'next/link';
import {
  RECOMMENDATION_LABEL,
  RECOMMENDATION_TONE,
  type KeywordResult,
} from './mock-data';

interface Props {
  results: KeywordResult[];
  onReset: () => void;
}

function DifficultyBar({ value }: { value: number }) {
  const color =
    value < 35 ? '#1D9E75' : value < 60 ? '#f59e0b' : value < 80 ? '#fb923c' : '#dc2626';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
          role="presentation"
        />
      </div>
      <span className="text-xs font-bold tabular-nums text-slate-700 w-10 text-right">
        {value}
      </span>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function KeywordResults({ results, onReset }: Props) {
  return (
    <section className="bg-slate-50 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-8 md:mb-10 text-center">
          <Badge className="bg-[#1D9E75] text-white border-0 mb-4 px-3 py-1 text-xs font-extrabold tracking-wide">
            ✓ {results.length} 組關鍵字分析完成
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight">
            這份報告告訴你
            <span className="text-[#1D9E75] mx-2">該打哪幾個</span>
          </h2>
        </header>

        {/* 透明度提示 */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
            <strong>關於數據來源</strong>：本工具目前以 adlo 內部模型估算（基於關鍵字長尾度、商業意圖、產業 CPC 平均），供
            <strong>方向性判斷</strong>用。正式上線 Google Ads Keyword Planner 串接後會顯示真實數據。
          </p>
        </div>

        {/* Desktop 表格 */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left p-4 font-bold text-slate-700">關鍵字</th>
                <th className="text-right p-4 font-bold text-slate-700 w-24">月搜尋</th>
                <th className="text-left p-4 font-bold text-slate-700 w-44">SEO 難度</th>
                <th className="text-right p-4 font-bold text-slate-700 w-24">CPC</th>
                <th className="text-left p-4 font-bold text-slate-700 w-44">建議</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r.keyword}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-emerald-50/20 transition-colors"
                >
                  <td className="p-4 font-semibold text-slate-900">{r.keyword}</td>
                  <td className="p-4 text-right font-bold tabular-nums text-slate-700">
                    {formatNumber(r.monthlySearches)}
                  </td>
                  <td className="p-4">
                    <DifficultyBar value={r.difficulty} />
                  </td>
                  <td className="p-4 text-right font-bold tabular-nums text-slate-700">
                    NT$ {r.cpcNtd}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${RECOMMENDATION_TONE[r.recommendation]}`}
                    >
                      {RECOMMENDATION_LABEL[r.recommendation]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Insight rows（每組 keyword 的詳細建議）*/}
          <div className="border-t-2 border-slate-100 bg-slate-50/40 px-6 py-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              逐字決策建議
            </p>
            <ul className="space-y-2.5">
              {results.map((r) => (
                <li key={`insight-${r.keyword}`} className="text-sm text-slate-700">
                  <strong className="text-slate-900">{r.keyword}</strong>
                  <span className="text-slate-400 mx-2">·</span>
                  {r.insight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile 卡片版 */}
        <div className="md:hidden space-y-4 mb-8">
          {results.map((r) => (
            <article
              key={r.keyword}
              className="bg-white rounded-2xl border border-slate-200 p-5"
            >
              <header className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {r.keyword}
                </h3>
                <span
                  className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold border shrink-0 ${RECOMMENDATION_TONE[r.recommendation]}`}
                >
                  {RECOMMENDATION_LABEL[r.recommendation]}
                </span>
              </header>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">月搜尋</p>
                  <p className="text-base font-extrabold text-slate-900 tabular-nums">
                    {formatNumber(r.monthlySearches)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">難度</p>
                  <p className="text-base font-extrabold text-slate-900 tabular-nums">
                    {r.difficulty}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">CPC</p>
                  <p className="text-base font-extrabold text-slate-900 tabular-nums">
                    NT${r.cpcNtd}
                  </p>
                </div>
              </div>

              <DifficultyBar value={r.difficulty} />

              <p className="mt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {r.insight}
              </p>
            </article>
          ))}
        </div>

        {/* Reset CTA */}
        <div className="text-center mb-12">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="text-sm"
            data-gtm-event="keyword_reset"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" aria-hidden />
            換一組關鍵字再分析
          </Button>
        </div>

        {/* 底部 3 推薦 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/check"
            aria-label="先測你自己的 GBP 健診"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="keyword_to_check"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 相關工具</div>
            <div className="font-bold text-slate-900 mb-1">先測 GBP 分數</div>
            <div className="text-xs text-slate-600 mb-3">關鍵字命中率是 GBP 六維度其中一項</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              GBP 健診 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/tools/competitor"
            aria-label="看同區對手有沒有打這些字"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="keyword_to_competitor"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 看對手</div>
            <div className="font-bold text-slate-900 mb-1">競爭對手雷達</div>
            <div className="text-xs text-slate-600 mb-3">同區 3 家對手關鍵字命中度比較</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              比較對手 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/diagnostic"
            aria-label="預約 30 分鐘關鍵字策略諮詢"
            className="group bg-white rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="keyword_to_diagnostic"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 想要專人諮詢</div>
            <div className="font-bold text-slate-900 mb-1">深度關鍵字策略</div>
            <div className="text-xs text-slate-600 mb-3">3 個月 SEO 路線圖 + 廣告預算配置建議</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              免費預約 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
