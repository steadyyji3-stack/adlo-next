'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Shield, Clock, UserX } from 'lucide-react';
import KeywordIllustration from './KeywordIllustration';
import NotAIChatBadge from '@/components/shared/NotAIChatBadge';
import type { KeywordInput } from './mock-data';

interface Props {
  onSubmit: (input: KeywordInput) => void;
  errorMsg?: string | null;
}

const MAX_KEYWORDS = 10;

function parseKeywords(raw: string): string[] {
  return raw
    .split(/[\n,，、;；]+/g)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

export default function KeywordHero({ onSubmit, errorMsg }: Props) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');

  const parsed = parseKeywords(raw);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (parsed.length === 0) {
      setError('至少輸入 1 個關鍵字');
      return;
    }
    if (parsed.length > MAX_KEYWORDS) {
      setError(`一次最多 ${MAX_KEYWORDS} 個關鍵字`);
      return;
    }
    if (parsed.some((k) => k.length > 30)) {
      setError('單個關鍵字不超過 30 字');
      return;
    }
    setError('');
    onSubmit({ keywords: parsed });
  }

  const displayError = error || errorMsg || '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <KeywordIllustration />

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            免費 · 不用註冊 · 一次最多 10 組
          </div>

          <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            這個關鍵字
            <br className="md:hidden" />
            <span className="text-[#1D9E75]">值不值得做</span>？
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            一次輸入 10 個台灣關鍵字。告訴你每組的<strong className="text-slate-900">搜尋熱度級距、SEO 難度、廣告 CPC 級距</strong>，加上「該 SEO、跑廣告、還是跳過」的決策建議。
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-3 max-w-xl mx-auto">
            ⚠️ 這是策略判斷工具，不顯示精準數字。要查真實搜尋量請用 Google Ads Keyword Planner（結果頁附直連）。
          </p>

          <NotAIChatBadge
            flow="輸入關鍵字 → 熱度級距 + SEO 難度 + CPC 區間"
            detail="台灣在地數據，不用註冊、不用 prompt。直接給「該 SEO、跑廣告、還是跳過」的決策建議。"
            className="mt-6"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
        >
          <div>
            <Label htmlFor="keywords" className="text-sm font-semibold text-slate-900 mb-2 block">
              關鍵字（每行一組，最多 10 組）<span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="keywords"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={'例如：\n植牙 台北\n無痛植牙\n植牙 推薦\n植牙 費用'}
              rows={6}
              className="text-base font-mono"
              aria-required="true"
              aria-describedby="keywords-help"
            />
            <p
              id="keywords-help"
              className="mt-2 text-xs text-slate-500 flex items-center justify-between"
            >
              <span>每行 / 逗號 / 頓號 都當分隔</span>
              <span className={parsed.length > MAX_KEYWORDS ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                {parsed.length} / {MAX_KEYWORDS}
              </span>
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 mt-5 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
            data-gtm-event="keyword_analyze"
          >
            <Search className="w-4 h-4 mr-2" aria-hidden />
            產出難度報告
          </Button>

          {displayError && (
            <p role="alert" className="mt-3 text-sm text-rose-600 text-center">
              {displayError}
            </p>
          )}
        </form>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不抓你的清單
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 5 秒給結果
          </li>
        </ul>
      </div>
    </section>
  );
}
