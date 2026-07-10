'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2 } from 'lucide-react';
import NotAIChatBadge from '@/components/shared/NotAIChatBadge';

const USE_CASES = [
  '行銷文案',
  '社群貼文',
  '客服回覆',
  'Email / 通知',
  'SEO 內容',
  '翻譯 / 潤稿',
  '資料整理分析',
  '其他',
];

const TONES = [
  { value: '親切口語', desc: '像跟客人聊天' },
  { value: '專業正式', desc: '可信、穩重' },
  { value: '活潑有趣', desc: '好玩、好記' },
  { value: '簡潔直接', desc: '不囉嗦、重點' },
];

const PLATFORMS = ['ChatGPT', 'Claude', 'Gemini', '不確定'];

export interface PromptFormValue {
  task: string;
  useCase: string;
  tone: string;
  platform: string;
}

interface Props {
  onSubmit: (value: PromptFormValue) => void;
  isLoading?: boolean;
}

export default function PromptGeneratorHero({ onSubmit, isLoading }: Props) {
  const [task, setTask] = useState('');
  const [useCase, setUseCase] = useState('');
  const [tone, setTone] = useState('');
  const [platform, setPlatform] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (task.trim().length < 6) {
      setError('請描述你想做的事，至少 6 個字（例：幫我寫一篇早午餐店開幕的 IG 貼文）');
      return;
    }
    if (!useCase) {
      setError('請選擇用途場景');
      return;
    }
    setError('');
    onSubmit({ task: task.trim(), useCase, tone, platform });
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white py-16 sm:py-24">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E1F5EE] text-[#0F6E56] text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Wand2 className="w-3.5 h-3.5" aria-hidden />
            免費 · 不用註冊 · 30 秒出結果
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-[1.1]"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            AI 提示詞{' '}
            <span className="text-[#1D9E75]">產生器</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            用一句話講你想做什麼，我幫你翻成
            <strong className="text-slate-800"> AI 一次就聽懂的提示詞</strong>，
            直接複製貼到 ChatGPT / Claude 就能用。
          </p>

          <NotAIChatBadge
            flow="一句口語需求 → 結構化提示詞 + 拆解教學"
            detail="不用學 prompt 技巧。填你想做的事，我給你可直接貼上的指令，還告訴你它為什麼這樣寫。"
            className="mt-6"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 p-6 sm:p-8 space-y-6"
        >
          {/* Task */}
          <div className="space-y-2">
            <Label htmlFor="task" className="text-sm font-bold text-slate-800">
              你想用 AI 做什麼？ <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="例：幫我寫一篇台中早午餐店開幕的 IG 貼文，想吸引附近上班族"
              className="resize-none"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-slate-400">用平常講話的方式寫就好，越具體越準。{task.length}/300</p>
          </div>

          {/* Use case */}
          <div className="space-y-2">
            <Label htmlFor="useCase" className="text-sm font-bold text-slate-800">
              用途場景 <span className="text-red-500">*</span>
            </Label>
            <Select value={useCase} onValueChange={setUseCase}>
              <SelectTrigger id="useCase" className="w-full">
                <SelectValue placeholder="這個提示詞主要用在…" />
              </SelectTrigger>
              <SelectContent>
                {USE_CASES.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tone (optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              語氣
              <span className="text-slate-400 font-normal ml-1">（選填）</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="語氣（選填）">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={tone === t.value}
                  onClick={() => setTone(tone === t.value ? '' : t.value)}
                  className={`relative rounded-xl border-2 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    tone === t.value
                      ? 'border-[#1D9E75] bg-[#E1F5EE]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">{t.value}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform (optional) */}
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-bold text-slate-800">
              主要會貼到哪個 AI？
              <span className="text-slate-400 font-normal ml-1">（選填）</span>
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform" className="w-full">
                <SelectValue placeholder="ChatGPT / Claude / Gemini…" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <Wand2 className="w-4 h-4" aria-hidden />
                產生提示詞
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-slate-400">
            不抓個資，不存內容，每次獨立產生。
          </p>
        </form>
      </div>
    </section>
  );
}
