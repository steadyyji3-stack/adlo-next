'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Shield, Clock, UserX } from 'lucide-react';
import SeoScorerIllustration from './SeoScorerIllustration';

interface Props {
  onSubmit: (url: string) => void;
  errorMsg?: string | null;
}

export default function SeoScorerHero({ onSubmit, errorMsg }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('請輸入要分析的文章 URL');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError('URL 需含 http:// 或 https://');
      return;
    }
    setError('');
    onSubmit(trimmed);
  }

  const displayError = error || errorMsg || '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-16 sm:py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <SeoScorerIllustration />

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            免費 · 不用註冊 · 10 秒給分數
          </div>

          <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            貼一個 URL，
            <br className="md:hidden" />
            <span className="text-[#1D9E75]">即時拿 SEO 分數</span>。
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            我們真的抓你的網頁 HTML，<strong className="text-slate-900">10 維度給分數 + 3 個最該先改的</strong>。
            不是用 AI 猜，是讀你的 title、H1、meta、字數、圖片 alt、連結結構直接算。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
        >
          <div>
            <Label htmlFor="article-url" className="text-sm font-semibold text-slate-900 mb-2 block">
              文章 URL <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="article-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com/blog/your-article"
              className="h-12 text-base"
              aria-required="true"
              aria-describedby="article-url-help"
            />
            <p id="article-url-help" className="mt-2 text-xs text-slate-500">
              貼單篇文章的完整網址（不是首頁、不是分類頁）。我們會抓那一頁的 HTML 算分。
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 mt-5 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
            data-gtm-event="seo_scorer_analyze"
          >
            <Search className="w-4 h-4 mr-2" aria-hidden />
            產出 SEO 報告
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
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不存你的 URL
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 10 秒給結果
          </li>
        </ul>
      </div>
    </section>
  );
}
