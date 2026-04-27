'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PenLine, Shield, Clock, UserX } from 'lucide-react';
import type { Industry, PostWriterInput } from './mock-data';

interface Props {
  onSubmit: (input: PostWriterInput) => void;
  errorMsg?: string | null;
}

const INDUSTRIES: Industry[] = [
  '餐飲',
  '美髮美容',
  '醫美',
  '牙科',
  '律師',
  '補教',
  '零售',
  '其他',
];

export default function PostWriterHero({ onSubmit, errorMsg }: Props) {
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [weekTheme, setWeekTheme] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (storeName.trim().length < 2) {
      setError('店名至少 2 個字');
      return;
    }
    if (!industry) {
      setError('請選擇你的產業類別');
      return;
    }
    setError('');
    onSubmit({
      storeName: storeName.trim(),
      industry: industry as Industry,
      weekTheme: weekTheme.trim() || undefined,
    });
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
            免費 · 不用註冊 · 30 秒出 7 篇
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            下週 7 天的
            <br className="md:hidden" />
            <span className="text-[#1D9E75]">Google 商家貼文</span>
            <br className="hidden md:block" />
            ，3 秒產出。
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            不是 AI 自動發，是給你寫好的初稿。
            <br className="hidden md:block" />
            節慶、教育、QA、幕後、促銷自動配，每週不再卡題。
          </p>
        </div>

        {/* 表單 */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl shadow-emerald-100/60 ring-1 ring-emerald-100 p-6 md:p-8"
        >
          <div className="space-y-5">
            <div>
              <Label
                htmlFor="store-name"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                店名 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="例：好初早餐 信義店"
                className="h-12 text-base"
                aria-required
              />
            </div>

            <div>
              <Label
                htmlFor="industry"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                產業類別 <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={industry}
                onValueChange={(v) => setIndustry(v as Industry)}
              >
                <SelectTrigger id="industry" className="h-12 text-base">
                  <SelectValue placeholder="選一個你的產業" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((it) => (
                    <SelectItem key={it} value={it}>
                      {it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="week-theme"
                className="text-sm font-semibold text-slate-900 mb-2 block"
              >
                本週主打 <span className="text-slate-400 font-normal text-xs">（選填）</span>
              </Label>
              <Input
                id="week-theme"
                type="text"
                value={weekTheme}
                onChange={(e) => setWeekTheme(e.target.value)}
                placeholder="例：母親節活動 / 新品上市 / 連假營業時間"
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base focus-visible:ring-emerald-500"
              data-gtm-event="post_writer_generate"
            >
              <PenLine className="w-4 h-4 mr-2" aria-hidden />
              產生這週貼文
            </Button>

            {displayError && (
              <p role="alert" className="text-sm text-rose-600 text-center">
                {displayError}
              </p>
            )}
          </div>
        </form>

        {/* 信任列 */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <UserX className="size-4 text-emerald-600" aria-hidden /> 不用註冊
          </li>
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" aria-hidden /> 不抓店家資料
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 30 秒出 7 篇
          </li>
        </ul>
      </div>
    </section>
  );
}
