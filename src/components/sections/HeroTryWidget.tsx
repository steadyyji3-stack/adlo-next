'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Check, ArrowRight, Wand2 } from 'lucide-react';
import { generatePosts, type Industry } from '@/lib/gbp-post-writer';

const INDUSTRIES: Industry[] = [
  '餐飲', '美髮美容', '醫美', '牙科', '律師', '補教', '零售', '其他',
];

interface SamplePost {
  day: string;
  category: string;
  title: string;
  content: string;
}

/**
 * 首頁互動「試一下」widget。
 * 輸入店名 + 產業 → 3 秒用 deterministic 引擎生一篇 GBP 貼文範例。
 * 目的：把被動讀者變主動參與者（停留 + 興趣），再導流 /my-week / /tools。
 * 零 API、零成本（純前端 generatePosts）。
 */
export default function HeroTryWidget() {
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [sample, setSample] = useState<SamplePost | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = storeName.trim();
    if (name.length < 2) {
      setError('輸入你的店名（2 字以上）');
      return;
    }
    if (!industry) {
      setError('選一個產業');
      return;
    }
    setError('');
    setCopied(false);
    // 取第二篇（教育型），最能展示「有用內容」而非問候語
    const posts = generatePosts({ storeName: name, industry: industry as Industry });
    const p = posts[1] ?? posts[0];
    setSample({ day: p.day, category: p.category, title: p.title, content: p.content });
  }

  async function copySample() {
    if (!sample) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(sample.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-5 border-b border-slate-100">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#0F6E56] uppercase mb-1.5">
          <Wand2 className="w-3.5 h-3.5" aria-hidden />
          現場試一下 · 不用註冊
        </div>
        <p className="text-lg font-bold text-slate-900 leading-snug">
          3 秒，幫你的店生一篇
          <br className="hidden lg:block" />
          Google 商家貼文
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-3">
        <Input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="輸入你的店名（例：榮芳商行）"
          className="h-12 text-base"
          aria-label="店名"
          maxLength={40}
        />
        <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
          <SelectTrigger className="h-12 text-base" aria-label="產業">
            <SelectValue placeholder="選你的產業" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.filter((it) => it !== '其他').map((it) => (
              <SelectItem key={it} value={it}>{it}</SelectItem>
            ))}
            <SelectGroup>
              <SelectLabel>裝潢修繕</SelectLabel>
              <SelectItem value="裝潢">裝潢</SelectItem>
              <SelectItem value="裝修">裝修</SelectItem>
              <SelectItem value="安裝">安裝</SelectItem>
              <SelectItem value="維修">維修</SelectItem>
            </SelectGroup>
            <SelectItem value="其他">其他</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 bg-[#1D9E75] hover:bg-[#168060] text-white font-bold text-base focus-visible:ring-emerald-500"
          data-gtm-event="home_try_widget_generate"
        >
          <Sparkles className="w-4 h-4 mr-2" aria-hidden />
          {sample ? '再生一篇' : '3 秒生成範例'}
        </Button>
        {error && <p role="alert" className="text-sm text-rose-600 text-center">{error}</p>}
      </form>

      {sample && (
          <div
            key={sample.title + sample.content}
            className="widget-result-fade px-6 pb-6"
            aria-live="polite"
          >
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 border text-[11px] font-bold">
                  {sample.day} · {sample.category}
                </Badge>
                <span className="text-[11px] text-slate-400 ml-auto">給 {storeName.trim()} 的範例</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1.5">{sample.title}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 line-clamp-6">
                {sample.content}
              </p>
              <button
                type="button"
                onClick={copySample}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6E56] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
              >
                {copied ? <><Check className="w-3.5 h-3.5" aria-hidden />已複製</> : <><Copy className="w-3.5 h-3.5" aria-hidden />複製這篇</>}
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Link
                href="/my-week"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1D9E75] text-white font-bold text-sm h-11 hover:bg-[#168060] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                data-gtm-event="home_try_widget_to_myweek"
              >
                這只是 7 篇裡的 1 篇 <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl ring-1 ring-slate-200 text-slate-700 font-bold text-sm h-11 px-4 hover:ring-emerald-400 hover:text-[#0F6E56] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                data-gtm-event="home_try_widget_to_tools"
              >
                12 支免費工具
              </Link>
            </div>
          </div>
        )}

      {!sample && (
        <div className="px-6 pb-6 -mt-2">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            不是 AI 聊天，是結構化工具。生成後可複製，也能看完整一週 7 篇。
          </p>
        </div>
      )}
    </div>
  );
}
