'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Shield, Clock, UserX } from 'lucide-react';

interface Props {
  onSubmit: (query: string) => void;
  errorMsg?: string | null;
}

export default function CheckHero({ onSubmit, errorMsg }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError('貼上 Google 地圖連結，或輸入「店名 + 地區」');
      return;
    }
    setError('');
    onSubmit(trimmed);
  }

  const displayError = error || errorMsg || '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            免費 · 不用註冊 · 30 秒看結果
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            30 秒，看懂你的
            <br className="md:hidden" />
            <span className="text-[#1D9E75]">Google 商家</span>
            <br className="hidden md:block" />
            在客人眼中幾分。
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            免費掃描評論、照片、回覆、關鍵字排名。
            <br className="hidden md:block" />
            給你一份看得懂、做得動的健檢報告。
          </p>
        </div>

        {/* 輸入框 */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="size-5 text-slate-400 shrink-0" aria-hidden />
              <Input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder='貼上 Google 地圖連結，或輸入「店名 + 地區」'
                className="border-0 shadow-none focus-visible:ring-0 text-base h-12 px-0"
                aria-label="店家搜尋輸入框"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 md:h-auto bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base px-8 focus-visible:ring-emerald-500"
            >
              免費查分數
            </Button>
          </div>
          {displayError && (
            <p role="alert" className="text-sm text-rose-600 mt-3 ml-2">{displayError}</p>
          )}
        </form>

        {/* 信任列 */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不抓個資
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 30 秒出結果
          </li>
        </ul>
      </div>
    </section>
  );
}
