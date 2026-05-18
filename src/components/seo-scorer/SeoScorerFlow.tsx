'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SeoScorerHero from './SeoScorerHero';
import SeoScorerResults from './SeoScorerResults';
import type { SeoScoreReport } from '@/lib/seo-scorer';

type Stage = 'idle' | 'loading' | 'done';

interface ApiResponse extends Partial<SeoScoreReport> {
  error?: string;
  message?: string;
  quota?: { count: number; limit: number; emailUnlocked: boolean };
}

export default function SeoScorerFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [report, setReport] = useState<SeoScoreReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');

  async function handleSubmit(url: string) {
    setErrorMsg(null);
    setStage('loading');
    setTargetUrl(url);

    try {
      const res = await fetch('/api/seo-scorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as ApiResponse;

      if (!res.ok) {
        setErrorMsg(data.message ?? data.error ?? '分析失敗');
        setStage('idle');
        return;
      }

      if (!data.url || !data.checks) {
        setErrorMsg('回應格式異常');
        setStage('idle');
        return;
      }

      setReport(data as SeoScoreReport);
      setStage('done');
    } catch (err) {
      console.error('[seo-scorer] API 失敗', err);
      setErrorMsg('連線失敗，請稍後再試');
      setStage('idle');
    }
  }

  function handleReset() {
    setStage('idle');
    setReport(null);
    setErrorMsg(null);
    setTargetUrl('');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (stage === 'loading') {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-20">
        <div className="text-center max-w-md mx-auto px-6">
          <Loader2
            className="w-12 h-12 mx-auto text-[#1D9E75] motion-safe:animate-spin mb-6"
            aria-hidden
          />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            正在抓你的網頁⋯
          </h2>
          <p className="text-sm text-slate-600 break-all">
            {targetUrl}
            <br />
            <span className="text-xs text-slate-400 mt-2 inline-block">
              fetch HTML → parse title / H1 / meta / 圖片 / 連結 → 10 維度評分
            </span>
          </p>
        </div>
      </section>
    );
  }

  if (stage === 'done' && report) {
    return <SeoScorerResults report={report} onReset={handleReset} />;
  }

  return <SeoScorerHero onSubmit={handleSubmit} errorMsg={errorMsg} />;
}
