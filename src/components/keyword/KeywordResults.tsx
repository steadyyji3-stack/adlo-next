'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import {
  VOLUME_LABEL,
  VOLUME_TONE,
  CPC_LABEL,
  CPC_TONE,
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

const KEYWORD_PLANNER_URL = 'https://ads.google.com/intl/zh-TW_tw/home/tools/keyword-planner/?utm_source=adlo';

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
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            策略決策用——不是精準數據查詢。每組分析下方都附「為什麼這樣判斷」的依據。
          </p>
        </header>

        {/* 透明度提示（升級版） */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5">
          <div className="flex gap-3 mb-2">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm font-extrabold text-amber-900">
              這是「策略判斷工具」，不是「Google Ads 數據查詢」
            </p>
          </div>
          <p className="text-xs md:text-sm text-amber-800 leading-relaxed pl-8">
            本工具用 adlo 的判斷邏輯告訴你「該不該打這個字」+「為什麼」。我們<strong>不顯示具體月搜尋量或 CPC 數字</strong>——因為那些只有 Google 自己最準。
            <br />
            想看真實搜尋量、CPC、競爭程度？請用：
            <a
              href="https://ads.google.com/intl/zh-TW_tw/home/tools/keyword-planner/?utm_source=adlo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-md font-bold text-xs hover:bg-amber-100 transition-colors"
            >
              Google Ads Keyword Planner
              <ExternalLink className="w-3 h-3" aria-hidden />
            </a>
            （Google 官方、免費，需 Google 帳號）
          </p>
        </div>

        {/* 結果卡片（取代原表格，因為現在是「等級 + 依據」更適合卡片） */}
        <div className="space-y-4 mb-8">
          {results.map((r) => (
            <article
              key={r.keyword}
              className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6"
              aria-label={`${r.keyword} 分析結果`}
            >
              <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-lg md:text-xl leading-snug">
                  {r.keyword}
                </h3>
                <span
                  className={`inline-block px-3 py-1.5 rounded-md text-xs font-bold border shrink-0 ${RECOMMENDATION_TONE[r.recommendation]}`}
                >
                  {RECOMMENDATION_LABEL[r.recommendation]}
                </span>
              </header>

              {/* 3 個等級 chip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-50/60 rounded-xl p-4">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    搜尋量
                  </p>
                  <p
                    className={`inline-block px-2.5 py-1 rounded-md text-sm font-extrabold ${VOLUME_TONE[r.searchVolumeBand]} mb-2`}
                  >
                    {VOLUME_LABEL[r.searchVolumeBand]}
                  </p>
                  <ul className="text-xs text-slate-600 leading-relaxed space-y-0.5">
                    {r.searchVolumeReasons.map((reason, i) => (
                      <li key={i}>· {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50/60 rounded-xl p-4">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    SEO 難度
                  </p>
                  <DifficultyBar value={r.difficulty} />
                  <ul className="text-xs text-slate-600 leading-relaxed space-y-0.5 mt-2">
                    {r.difficultyReasons.map((reason, i) => (
                      <li key={i}>· {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50/60 rounded-xl p-4">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                    CPC 級距
                  </p>
                  <p
                    className={`inline-block px-2.5 py-1 rounded-md text-sm font-extrabold ${CPC_TONE[r.cpcBand]} mb-2`}
                  >
                    {CPC_LABEL[r.cpcBand]}
                  </p>
                  <ul className="text-xs text-slate-600 leading-relaxed space-y-0.5">
                    {r.cpcReasons.map((reason, i) => (
                      <li key={i}>· {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 決策建議文字 */}
              <div className="bg-emerald-50/60 border-l-4 border-[#1D9E75] pl-4 py-2.5 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">建議：</strong>
                  {r.insight}
                </p>
              </div>

              {/* 查真實數據 */}
              <div className="flex items-center justify-end">
                <a
                  href={KEYWORD_PLANNER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1D9E75] transition-colors"
                  data-gtm-event="keyword_to_google_planner"
                  aria-label={`用 Google Ads Keyword Planner 查「${r.keyword}」的真實數據`}
                >
                  查這個字的 Google 真實數字
                  <ExternalLink className="w-3 h-3" aria-hidden />
                </a>
              </div>
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
