'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Target,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import type { SeoScoreReport, ScorerCheck } from '@/lib/seo-scorer';

interface Props {
  report: SeoScoreReport;
  onReset: () => void;
}

const STATUS_META: Record<
  ScorerCheck['status'],
  { icon: React.ComponentType<{ className?: string }>; tone: string; label: string }
> = {
  pass: {
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: '通過',
  },
  warn: {
    icon: AlertCircle,
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    label: '可改善',
  },
  fail: {
    icon: XCircle,
    tone: 'bg-rose-50 text-rose-700 border-rose-200',
    label: '待處理',
  },
};

function GradeBadge({ grade, score }: { grade: SeoScoreReport['grade']; score: number }) {
  const colors: Record<SeoScoreReport['grade'], string> = {
    A: 'bg-[#1D9E75] text-white',
    B: 'bg-emerald-500 text-white',
    C: 'bg-amber-500 text-white',
    D: 'bg-orange-500 text-white',
    F: 'bg-rose-500 text-white',
  };
  return (
    <div
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl ${colors[grade]} shadow-md`}
    >
      <span className="text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
        {grade}
      </span>
      <div className="text-left">
        <p className="text-xs font-bold uppercase tracking-widest opacity-90">總分</p>
        <p className="text-2xl font-extrabold tabular-nums leading-none">{score}<span className="text-sm opacity-75">/100</span></p>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: ScorerCheck }) {
  const meta = STATUS_META[check.status];
  const Icon = meta.icon;
  return (
    <article className={`border rounded-xl p-4 md:p-5 ${meta.tone.split(' ').slice(-1)[0]}`}>
      <header className="flex items-start gap-3 mb-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-extrabold text-slate-900 text-base">{check.label}</h3>
            <span className="text-sm font-bold tabular-nums text-slate-500">
              {check.score}/10
            </span>
          </div>
          <span className={`inline-block px-2 py-0.5 mt-1.5 rounded text-[10px] font-bold ${meta.tone}`}>
            {meta.label}
          </span>
        </div>
      </header>

      <dl className="space-y-2 text-sm pl-8">
        <div>
          <dt className="text-xs text-slate-500">偵測到</dt>
          <dd className="text-slate-700">{check.found}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">理想標準</dt>
          <dd className="text-slate-600">{check.ideal}</dd>
        </div>
        {check.status !== 'pass' && (
          <div className="bg-white/60 border border-slate-200 rounded-lg px-3 py-2 mt-1">
            <dt className="text-xs font-bold text-[#0F6E56] mb-0.5">該怎麼改</dt>
            <dd className="text-sm text-slate-800">{check.fix}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

export default function SeoScorerResults({ report, onReset }: Props) {
  const passCount = report.checks.filter((c) => c.status === 'pass').length;
  const warnCount = report.checks.filter((c) => c.status === 'warn').length;
  const failCount = report.checks.filter((c) => c.status === 'fail').length;

  return (
    <section className="bg-slate-50 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <header className="mb-8 md:mb-10 text-center">
          <Badge className="bg-[#1D9E75] text-white border-0 mb-4 px-3 py-1 text-xs font-extrabold tracking-wide">
            ✓ 分析完成
          </Badge>
          <p className="text-xs text-slate-500 mb-4 break-all max-w-2xl mx-auto">
            {report.url}
          </p>
          <div className="mb-5 flex justify-center">
            <GradeBadge grade={report.grade} score={report.overallScore} />
          </div>
          <p className="text-sm md:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
            {report.insight}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden />
              通過 {passCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden />
              可改善 {warnCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden />
              待處理 {failCount}
            </span>
          </div>
        </header>

        {/* Top 3 fixes */}
        {report.topFixes.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-8">
            <p className="text-xs font-extrabold text-[#0F6E56] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" aria-hidden />
              最該先改的 3 件事
            </p>
            <ol className="space-y-3">
              {report.topFixes.map((fix, i) => (
                <li
                  key={fix.id}
                  className="flex gap-3 items-start border-l-4 border-[#1D9E75] pl-4 py-1"
                >
                  <span className="font-extrabold text-2xl text-[#1D9E75] leading-none">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{fix.label}</p>
                    <p className="text-sm text-slate-700 leading-relaxed mt-1">{fix.fix}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 10 維度詳細 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-8">
          <h2 className="text-base md:text-lg font-extrabold text-slate-900 mb-4">
            10 維度詳細
          </h2>
          <div className="space-y-3">
            {report.checks.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="text-center mb-12">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="text-sm"
            data-gtm-event="seo_scorer_reset"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" aria-hidden />
            分析另一篇文章
          </Button>
        </div>

        {/* 底部三推薦 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/check"
            aria-label="先測你的 GBP 分數"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="seo_scorer_to_check"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 相關工具</div>
            <div className="font-bold text-slate-900 mb-1">GBP 健診</div>
            <div className="text-xs text-slate-600 mb-3">SEO 站內外都做，先看你 Google 商家幾分</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              GBP 健診 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/tools/keyword"
            aria-label="檢查目標關鍵字難度"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="seo_scorer_to_keyword"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 規劃下一篇</div>
            <div className="font-bold text-slate-900 mb-1">關鍵字難度檢查</div>
            <div className="text-xs text-slate-600 mb-3">下一篇要打什麼字？先看難度跟 CPC 等級</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              關鍵字檢查 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/diagnostic"
            aria-label="預約深度 SEO 諮詢"
            className="group bg-white rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="seo_scorer_to_diagnostic"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 想要專人協助</div>
            <div className="font-bold text-slate-900 mb-1">深度 SEO 諮詢</div>
            <div className="text-xs text-slate-600 mb-3">站內 + 站外 + 內容策略一次規劃</div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              免費預約 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-center text-xs text-slate-400 inline-flex items-center justify-center gap-1.5 w-full">
          <ExternalLink className="w-3 h-3" aria-hidden />
          報告以你提供的 URL 即時 HTML 為準，分析結果不被儲存
        </p>
      </div>
    </section>
  );
}
