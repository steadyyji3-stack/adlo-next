'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RotateCcw, Wand2, Lightbulb, ListTree } from 'lucide-react';
import type {
  PromptBreakdownItem,
  PromptVariant,
} from '@/lib/groq';

interface Props {
  mainPrompt: string;
  breakdown: PromptBreakdownItem[];
  variants: PromptVariant[];
  tips: string[];
  useCase: string;
  onReset: () => void;
}

function CopyButton({ text, label = '複製' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-[#0F6E56] bg-[#E1F5EE] border border-[#1D9E75]/30 hover:bg-emerald-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" aria-hidden /> 已複製
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" aria-hidden /> {label}
        </>
      )}
    </button>
  );
}

export default function PromptGeneratorResults({
  mainPrompt,
  breakdown,
  variants,
  tips,
  useCase,
  onReset,
}: Props) {
  return (
    <section className="py-12 sm:py-16 bg-white min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-widest mb-1">
              {useCase}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              你的提示詞好了
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              複製下面這段，直接貼到 ChatGPT / Claude 就能用。
            </p>
          </div>
          <Button
            onClick={onReset}
            variant="outline"
            className="flex items-center gap-1.5 text-sm self-start sm:self-center"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
            重新產生
          </Button>
        </div>

        {/* Main prompt */}
        <div className="rounded-2xl border-2 border-[#1D9E75]/40 bg-gradient-to-br from-emerald-50/60 to-white overflow-hidden mb-8">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#1D9E75]/20 bg-white/60">
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Wand2 className="w-4 h-4 text-[#1D9E75]" aria-hidden />
              建議提示詞
            </span>
            <CopyButton text={mainPrompt} label="複製提示詞" />
          </div>
          <pre className="px-5 py-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {mainPrompt}
          </pre>
        </div>

        {/* Breakdown */}
        {breakdown.length > 0 && (
          <div className="mb-8">
            <h3 className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900 mb-4">
              <ListTree className="w-4 h-4 text-[#1D9E75]" aria-hidden />
              這個提示詞為什麼這樣寫（拆解）
            </h3>
            <div className="space-y-2.5">
              {breakdown.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4"
                >
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-slate-200 text-slate-600 shrink-0 mt-0.5"
                  >
                    {b.label}
                  </Badge>
                  <p className="text-sm text-slate-600 leading-relaxed">{b.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        {variants.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">
              另外兩個版本，挑一個合手的
            </h3>
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-900">{v.label}</span>
                      {v.angle && (
                        <span className="text-xs text-slate-500 ml-2">{v.angle}</span>
                      )}
                    </div>
                    <CopyButton text={v.prompt} />
                  </div>
                  <pre className="px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {v.prompt}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 mb-10">
            <h3 className="inline-flex items-center gap-2 text-sm font-extrabold text-amber-900 mb-3">
              <Lightbulb className="w-4 h-4" aria-hidden />
              讓 AI 回得更好的小技巧
            </h3>
            <ul className="space-y-2">
              {tips.map((t, i) => (
                <li key={i} className="text-sm text-amber-900/90 leading-relaxed flex gap-2">
                  <span className="text-amber-500 font-bold shrink-0">·</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-[#1D9E75]/20 rounded-2xl p-6 text-center">
          <p className="text-sm font-bold text-slate-900 mb-1">
            提示詞寫好了，但每週素材還是要自己想？
          </p>
          <p className="text-sm text-slate-500 mb-4">
            GBP 貼文、LINE 推播、店名 slogan——adlo 工具箱直接給你結果，全部免費。
          </p>
          <a
            href="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1D9E75] hover:underline"
          >
            看全部免費工具 →
          </a>
        </div>
      </div>
    </section>
  );
}
