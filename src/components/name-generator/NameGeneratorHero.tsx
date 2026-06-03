'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import NotAIChatBadge from '@/components/shared/NotAIChatBadge';

const INDUSTRY_GROUPS: { label: string; items: string[] }[] = [
  {
    label: '餐飲',
    items: ['餐廳 / 正餐', '小吃 / 便當', '咖啡 / 飲料店', '甜點 / 烘焙', '麵包店'],
  },
  {
    label: '美容 / 健康',
    items: ['美髮 / 美容', '美甲 / 美睫', 'SPA / 按摩', '健身 / 瑜伽', '醫美', '牙科'],
  },
  {
    label: '生活服務',
    items: ['零售 / 服飾', '住宿 / 民宿', '寵物服務', '花藝 / 園藝', '攝影'],
  },
  {
    label: '專業服務',
    items: ['律師 / 會計', '補習 / 教育', '顧問 / 諮詢', '設計 / 創意', '其他'],
  },
];

const STYLES = [
  { value: '溫馨親切', desc: '讓客人一進門就放鬆' },
  { value: '專業可信', desc: '強調技術力和信任感' },
  { value: '趣味活潑', desc: '好玩、好記、容易口耳相傳' },
  { value: '文青小清新', desc: '有質感、有故事感' },
  { value: '潮流現代', desc: '年輕、設計感、跟上趨勢' },
];

export interface NameFormValue {
  industry: string;
  style: string;
  target: string;
  keywords: string;
}

interface Props {
  onSubmit: (value: NameFormValue) => void;
  isLoading?: boolean;
}

export default function NameGeneratorHero({ onSubmit, isLoading }: Props) {
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('');
  const [target, setTarget] = useState('');
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!industry) { setError('請選擇產業類別'); return; }
    if (!style) { setError('請選擇品牌風格'); return; }
    if (target.trim().length < 4) { setError('客群描述至少 4 個字（例：30–40 歲喜歡質感生活的女性）'); return; }
    setError('');
    onSubmit({ industry, style, target: target.trim(), keywords: keywords.trim() });
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E1F5EE] text-[#0F6E56] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            免費 · 不用註冊 · 30 秒出結果
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-[1.1]"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            店名 /{' '}
            <span className="text-[#1D9E75]">Slogan</span>{' '}
            產生器
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            輸入產業、風格、客群，AI 一次給你
            <strong className="text-slate-800"> 15 組店名 + 10 組 slogan</strong>，
            每組附上「為什麼這個名字能被記住」。
          </p>

          <NotAIChatBadge
            flow="勾產業 + 風格 + 客群 → 15 組店名 + 10 組 Slogan"
            detail="用 AI、但不用打對話。結構化選 4 個欄位 → 一次給整批，附「為什麼能被記住」解釋。"
            className="mt-6"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 p-6 sm:p-8 space-y-6"
        >
          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-bold text-slate-800">
              產業類別 <span className="text-red-500">*</span>
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry" className="w-full">
                <SelectValue placeholder="選擇你的產業…" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              品牌風格 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="品牌風格">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={style === s.value}
                  onClick={() => setStyle(s.value)}
                  className={`relative rounded-xl border-2 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    style === s.value
                      ? 'border-[#1D9E75] bg-[#E1F5EE]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">{s.value}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target audience */}
          <div className="space-y-2">
            <Label htmlFor="target" className="text-sm font-bold text-slate-800">
              主要客群 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="例：30–45 歲喜歡質感生活的台北女性"
              maxLength={60}
            />
            <p className="text-xs text-slate-400">越具體，名字越準確。</p>
          </div>

          {/* Optional keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-sm font-bold text-slate-800">
              想包含的概念或文字
              <span className="text-slate-400 font-normal ml-1">（選填）</span>
            </Label>
            <Textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例：日式、手工、台南、根、森林、光…"
              className="resize-none"
              rows={2}
              maxLength={60}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 font-medium" role="alert">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1D9E75] hover:bg-[#168060] text-white font-bold text-base py-3 rounded-xl shadow-lg shadow-emerald-200 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden />
                產生中…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" aria-hidden />
                產生店名 + Slogan
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            不抓個資，不存店名，每次獨立產生。
          </p>
        </form>
      </div>
    </section>
  );
}
