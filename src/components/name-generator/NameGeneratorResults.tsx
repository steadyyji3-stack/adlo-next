'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RotateCcw, Store, MessageSquare } from 'lucide-react';
import type { GeneratedName, GeneratedSlogan } from '@/lib/groq';

interface Props {
  names: GeneratedName[];
  slogans: GeneratedSlogan[];
  industry: string;
  onReset: () => void;
}

function CopyButton({ text }: { text: string }) {
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
      aria-label={copied ? '已複製' : '複製'}
      className="ml-auto flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-[#1D9E75] hover:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {copied ? (
        <Check className="w-4 h-4 text-[#1D9E75]" aria-hidden />
      ) : (
        <Copy className="w-4 h-4" aria-hidden />
      )}
    </button>
  );
}

type Tab = 'names' | 'slogans';

const CATEGORY_COLORS: Record<string, string> = {
  地方感: 'bg-blue-50 text-blue-700 border-blue-200',
  職人感: 'bg-amber-50 text-amber-700 border-amber-200',
  感官記憶: 'bg-pink-50 text-pink-700 border-pink-200',
  人物化: 'bg-violet-50 text-violet-700 border-violet-200',
  概念法: 'bg-sky-50 text-sky-700 border-sky-200',
  音韻法: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const TONE_COLORS: Record<string, string> = {
  溫馨: 'bg-orange-50 text-orange-700 border-orange-200',
  專業: 'bg-blue-50 text-blue-700 border-blue-200',
  趣味: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  直白: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function NameGeneratorResults({ names, slogans, industry, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('names');

  return (
    <section className="py-12 sm:py-16 bg-white min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-widest mb-1">
              {industry}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-slate-900"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              你的命名清單來了
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {names.length} 組店名 · {slogans.length} 組 slogan，點右側按鈕複製
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

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'names'}
            onClick={() => setTab('names')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              tab === 'names'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Store className="w-4 h-4" aria-hidden />
            店名 {names.length} 組
          </button>
          <button
            role="tab"
            aria-selected={tab === 'slogans'}
            onClick={() => setTab('slogans')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              tab === 'slogans'
                ? 'bg-white text-slate-900 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" aria-hidden />
            Slogan {slogans.length} 組
          </button>
        </div>

        {/* Names Tab */}
        {tab === 'names' && (
          <div role="tabpanel" className="space-y-3" aria-label="店名列表">
            {names.map((n, i) => {
              const colorCls = CATEGORY_COLORS[n.category] ?? 'bg-slate-50 text-slate-600 border-slate-200';
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1D9E75]/40 transition-colors group"
                >
                  <span
                    className="shrink-0 w-8 h-8 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-xs font-extrabold flex items-center justify-center"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-lg font-extrabold text-slate-900">{n.name}</span>
                      {n.category && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold border ${colorCls}`}
                        >
                          {n.category}
                        </Badge>
                      )}
                    </div>
                    {n.reason && (
                      <p className="text-sm text-slate-500 leading-relaxed">{n.reason}</p>
                    )}
                  </div>
                  <CopyButton text={n.name} />
                </div>
              );
            })}
          </div>
        )}

        {/* Slogans Tab */}
        {tab === 'slogans' && (
          <div role="tabpanel" className="space-y-3" aria-label="Slogan 列表">
            {slogans.map((s, i) => {
              const toneCls = TONE_COLORS[s.tone] ?? 'bg-slate-100 text-slate-600 border-slate-200';
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1D9E75]/40 transition-colors"
                >
                  <span
                    className="shrink-0 w-8 h-8 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-xs font-extrabold flex items-center justify-center"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-base font-bold text-slate-900">「{s.slogan}」</span>
                      {s.tone && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold border ${toneCls}`}
                        >
                          {s.tone}
                        </Badge>
                      )}
                    </div>
                    {s.reason && (
                      <p className="text-sm text-slate-500 leading-relaxed">
                        適用：{s.reason}
                      </p>
                    )}
                  </div>
                  <CopyButton text={s.slogan} />
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-br from-emerald-50 to-white border border-[#1D9E75]/20 rounded-2xl p-6 text-center">
          <p className="text-sm font-bold text-slate-900 mb-1">
            名字選好了，接下來需要什麼？
          </p>
          <p className="text-sm text-slate-500 mb-4">
            GBP 健診、評論收集連結、競爭對手雷達——都在工具箱裡，全部免費。
          </p>
          <a
            href="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1D9E75] hover:underline"
          >
            看全部 7 支工具 →
          </a>
        </div>
      </div>
    </section>
  );
}
