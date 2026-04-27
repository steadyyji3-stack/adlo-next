'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, Copy, Check } from 'lucide-react';
import type { CheckResult } from './CheckFlow';
import { trackCheckShare } from '@/lib/gtm';

interface Props {
  result: CheckResult;
}

type Scenario = 'high' | 'mid' | 'low';
type Size = 'square' | 'story';

function pickScenario(score: number): Scenario {
  if (score >= 80) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

const SCENARIO_COPY: Record<Scenario, (r: CheckResult) => { title: string; body: string }> = {
  high: (r) => ({
    title: `${r.storeName} 拿到 ${r.score} 分 🌿`,
    body: `在 ${r.location} 屬於前 ${r.regionRankPercent}%\n→ 你家幾分？adlo.tw/check`,
  }),
  mid: (r) => ({
    title: `剛測了自己店家：${r.score} 分`,
    body: `${r.weakestMetric} 被點名\n→ 來測一下 adlo.tw/check`,
  }),
  low: (r) => ({
    title: `原來我是 ${r.score} 分⋯`,
    body: `${r.weakestMetric} 要補\n→ 你的店呢？adlo.tw/check`,
  }),
};

export default function CheckShareCards({ result }: Props) {
  const scenario = pickScenario(result.score);
  const [size, setSize] = useState<Size>('square');
  const [copied, setCopied] = useState(false);

  const copy = useMemo(() => SCENARIO_COPY[scenario](result), [scenario, result]);

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams({
      name: result.storeName,
      score: String(result.score),
      scenario,
      size,
      weak: result.weakestMetric,
      loc: result.location,
      rank: String(result.regionRankPercent),
    });
    return `/api/og/check-share?${params.toString()}`;
  }, [result, scenario, size]);

  async function handleCopy() {
    try {
      const text = `${copy.title}\n${copy.body}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackCheckShare('copy', { score: result.score, size });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'adlo 商家健檢',
          text: `${copy.title}\n${copy.body}`,
          url: 'https://adlo.tw/check',
        });
        trackCheckShare('share', { score: result.score, size });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }

  function handleDownload() {
    trackCheckShare('download', { score: result.score, size });
  }

  return (
    <section className="py-16 md:py-20 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-2">把結果分享給朋友</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">你的分享卡已備好</h2>
          <p className="text-sm text-slate-600">選尺寸下載，或直接分享到 LINE / IG</p>
        </div>

        {/* 尺寸切換 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => setSize('square')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                size === 'square' ? 'bg-[#1D9E75] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              方形（LINE／FB）
            </button>
            <button
              type="button"
              onClick={() => setSize('story')}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                size === 'story' ? 'bg-[#1D9E75] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              直式（IG Stories）
            </button>
          </div>
        </div>

        {/* 分享卡預覽 */}
        <div className="flex justify-center mb-8">
          <Card className="overflow-hidden border-emerald-100 shadow-lg shadow-emerald-100/50">
            <CardContent className="p-0">
              <img
                src={shareUrl}
                alt={`${result.storeName} 健檢分享卡`}
                className={size === 'square' ? 'w-[320px] h-[320px] md:w-[400px] md:h-[400px]' : 'w-[260px] h-[462px] md:w-[320px] md:h-[568px]'}
              />
            </CardContent>
          </Card>
        </div>

        {/* 動作按鈕 */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#1D9E75] hover:bg-[#168060] text-white gap-2 focus-visible:ring-emerald-500"
          >
            <a
              href={shareUrl}
              download={`adlo-check-${result.score}.png`}
              onClick={handleDownload}
            >
              <Download className="size-4" aria-hidden />
              下載分享卡
            </a>
          </Button>
          <Button
            onClick={handleNativeShare}
            size="lg"
            variant="outline"
            className="gap-2 border-slate-300"
          >
            <Share2 className="size-4" aria-hidden />
            分享到 LINE／IG
          </Button>
          <Button
            onClick={handleCopy}
            size="lg"
            variant="ghost"
            className="gap-2 text-slate-600"
          >
            {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? '已複製文字' : '複製文字'}
          </Button>
        </div>

        {/* 分享卡文案預覽 */}
        <Card className="mt-8 max-w-md mx-auto bg-white border-slate-200">
          <CardContent className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">文字版本</p>
            <p className="text-sm text-slate-800 whitespace-pre-line">
              <span className="font-semibold block mb-1">{copy.title}</span>
              {copy.body}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
