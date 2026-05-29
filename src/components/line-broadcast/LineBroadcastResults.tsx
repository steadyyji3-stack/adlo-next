'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  LINE_REDLINES,
  LINE_PLAN_HINTS,
  type GeneratedBroadcast,
} from '@/lib/line-broadcast';

interface Props {
  storeName: string;
  broadcasts: GeneratedBroadcast[];
  onReset: () => void;
}

const CATEGORY_COLOR: Record<string, string> = {
  歡迎: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  教育: 'bg-blue-100 text-blue-800 border-blue-200',
  QA: 'bg-violet-100 text-violet-800 border-violet-200',
  幕後: 'bg-amber-100 text-amber-800 border-amber-200',
  新品: 'bg-rose-100 text-rose-800 border-rose-200',
  促銷: 'bg-orange-100 text-orange-800 border-orange-200',
  節慶: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function LineBroadcastResults({
  storeName,
  broadcasts,
  onReset,
}: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copyFailedIdx, setCopyFailedIdx] = useState<number | null>(null);

  async function handleCopy(message: string, idx: number) {
    setCopyFailedIdx(null);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
        return;
      }
      throw new Error('clipboard-unavailable');
    } catch (err) {
      console.error('[line-broadcast] copy failed', err);
      setCopyFailedIdx(idx);
      setTimeout(() => setCopyFailedIdx(null), 3000);
    }
  }

  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-4">
            產出完成
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {storeName} 下週 7 天 LINE 推播
          </h2>
          <p className="text-sm text-slate-600">
            每篇都可以單獨複製。建議從中挑 2-3 篇推播，不要 7 篇全推。
          </p>
        </div>

        {/* Broadcast cards */}
        <div className="space-y-4">
          {broadcasts.map((b, idx) => {
            const headingId = `broadcast-${idx}-heading`;
            return (
              <article
                key={b.day}
                aria-labelledby={headingId}
                className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3 id={headingId} className="font-bold text-slate-900 text-base m-0">
                    {b.day}・{b.category}
                  </h3>
                  <Badge
                    className={`${CATEGORY_COLOR[b.category] ?? 'bg-slate-100'} border text-xs font-bold`}
                  >
                    {b.category}
                  </Badge>
                  <span className="text-xs text-slate-500 ml-auto">
                    {b.characterCount} 字 · 建議 {b.bestTime} · {b.emoji}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-500 mb-3">
                  {b.title}
                </p>

                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800 bg-slate-50 rounded-lg p-4 mb-3 ring-1 ring-slate-200">
                  {b.message}
                </pre>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(b.message, idx)}
                  className="text-xs"
                  aria-label={`複製 ${b.day} ${b.category} 推播文案`}
                  data-gtm-event={`line_broadcast_copy_${b.category}`}
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                      已複製
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" aria-hidden />
                      複製這篇
                    </>
                  )}
                </Button>

                {copyFailedIdx === idx && (
                  <p
                    role="alert"
                    className="mt-2 text-xs text-rose-600"
                  >
                    複製失敗。請手動長按上方文字選取後複製。
                  </p>
                )}
              </article>
            );
          })}
        </div>

        {/* Live region for screen readers — announces copy success */}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {copiedIdx !== null && broadcasts[copiedIdx]
            ? `已複製 ${broadcasts[copiedIdx].day} ${broadcasts[copiedIdx].category} 推播文案`
            : ''}
        </div>

        {/* Redlines */}
        <div className="mt-12 bg-white rounded-2xl ring-1 ring-amber-200 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-5">
            <AlertTriangle
              className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
              aria-hidden
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                推播前先看：6 個避免被封鎖的紅線
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                封鎖率會影響後續推播觸及（業界普遍觀察）。踩到下方紅線會明顯增加封鎖率。
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {LINE_REDLINES.map((r, idx) => (
              <div
                key={r.rule}
                className="border-l-4 border-amber-300 pl-4 py-1"
              >
                <p className="font-bold text-slate-900 text-sm">
                  {idx + 1}. {r.rule}
                </p>
                <p className="text-xs text-slate-600 mt-1">{r.why}</p>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 bg-amber-50/60 rounded p-2 mt-2 leading-relaxed">
                  {r.example}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Plan hints */}
        <div className="mt-8 bg-white rounded-2xl ring-1 ring-slate-200 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden />
            LINE OA 推播額度提示
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            選方案前算清楚：好友數 × 一週推播次數 × 4 週 ≤ 月額度。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-600">
                    方案
                  </th>
                  <th className="text-left p-3 font-semibold text-slate-600">
                    月額度
                  </th>
                  <th className="text-left p-3 font-semibold text-slate-600">
                    適合
                  </th>
                </tr>
              </thead>
              <tbody>
                {LINE_PLAN_HINTS.map((p) => (
                  <tr key={p.plan} className="border-t border-slate-200">
                    <td className="p-3 font-bold text-slate-900">{p.plan}</td>
                    <td className="p-3 text-slate-700">
                      {p.monthlyMessages.toLocaleString()} 則
                    </td>
                    <td className="p-3 text-slate-600">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA / Cross-link */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <Link
            href="/tools/post-writer"
            aria-label="下一步：使用 GBP 貼文產生器寫 Google 商家貼文"
            className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 hover:ring-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            data-gtm-event="line_broadcast_xlink_post_writer"
          >
            <p className="text-xs font-semibold text-emerald-700 mb-2">
              下一步
            </p>
            <p className="font-bold text-slate-900 mb-1">
              GBP 貼文也順手寫一寫
            </p>
            <p className="text-sm text-slate-600">
              同一週素材可以拆成 GBP 7 天貼文，多一個免費觸及通路。
            </p>
          </Link>
          <Link
            href="/check"
            aria-label="先用 GBP 健檢看 Google 商家 6 個維度幾分"
            className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 hover:ring-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            data-gtm-event="line_broadcast_xlink_check"
          >
            <p className="text-xs font-semibold text-emerald-700 mb-2">
              健檢
            </p>
            <p className="font-bold text-slate-900 mb-1">
              先看 GBP 6 個維度幾分
            </p>
            <p className="text-sm text-slate-600">
              花再多時間做 LINE，GBP 沒打對效率還是有限。30 秒檢查。
            </p>
          </Link>
        </div>

        <div className="text-center mt-10">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden />
            換一組重新產出
          </Button>
        </div>
      </div>
    </section>
  );
}
