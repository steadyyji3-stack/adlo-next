'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, RotateCcw, Star, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReviewReplyVariant } from '@/lib/groq';

interface Props {
  rating: number;
  variants: ReviewReplyVariant[];
  tips: string[];
  onReset: () => void;
}

function ReplyCard({ variant }: { variant: ReviewReplyVariant }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(variant.reply);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:border-[#1D9E75]/40 hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900">{variant.label}</h3>
          {variant.angle && <p className="text-xs text-slate-500 mt-0.5">{variant.angle}</p>}
        </div>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6E56] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
          data-gtm-event="review_reply_copy"
        >
          {copied ? <><Check className="w-3.5 h-3.5" aria-hidden />已複製</> : <><Copy className="w-3.5 h-3.5" aria-hidden />複製</>}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm md:text-[15px] text-slate-700 leading-relaxed">
        {variant.reply}
      </p>
    </div>
  );
}

export default function ReviewReplyResults({ rating, variants, tips, onReset }: Props) {
  return (
    <section className="bg-gradient-to-b from-emerald-50/60 via-white to-white py-14 md:py-20">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20 px-4 py-1.5 text-xs font-bold text-[#0F6E56] mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                aria-hidden
              />
            ))}
            <span className="ml-1.5">{rating} 星評論</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">挑一種，複製就能回</h2>
          <p className="text-sm md:text-base text-slate-600">
            建議照這則評論的實際內容微調一兩個字，會更像你自己說的話。
          </p>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <ReplyCard key={i} variant={v} />
          ))}
        </div>

        {tips.length > 0 && (
          <div className="mt-8 bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-5 md:p-6">
            <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[#0F6E56] mb-3">
              <Lightbulb className="w-4 h-4" aria-hidden /> 回這類評論的要點
            </h3>
            <ul className="space-y-2">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                  <span className="text-[#1D9E75] mt-0.5">·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="flex-1 text-sm text-slate-600 leading-relaxed">
            還沒什麼評論可回？先把<strong className="text-slate-900">收評論</strong>的管道做起來，回覆才有素材。
          </p>
          <Link
            href="/tools/review-link"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1D9E75] text-white font-bold text-sm h-11 px-4 hover:bg-[#168060] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            做評論收集連結 <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="font-semibold border-slate-300 hover:border-[#1D9E75] hover:text-[#1D9E75]"
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden /> 回覆另一則
          </Button>
        </div>
      </div>
    </section>
  );
}
