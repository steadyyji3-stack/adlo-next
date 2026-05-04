'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import CompetitorHero from './CompetitorHero';
import CompetitorResults from './CompetitorResults';
import {
  mockGenerateCompetitorReport,
  type CompetitorInput,
  type CompetitorResult,
} from './mock-data';

type Stage = 'idle' | 'loading' | 'done';

export default function CompetitorFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [storeName, setStoreName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(input: CompetitorInput) {
    setErrorMsg(null);
    setStage('loading');
    setStoreName(input.storeName);

    // Path C：mock 2 秒延遲
    await new Promise((r) => setTimeout(r, 2200));

    try {
      const generated = mockGenerateCompetitorReport(input);
      setResult(generated);
      setStage('done');
    } catch (err) {
      console.error('[competitor] mock 失敗', err);
      setErrorMsg('產生失敗，請稍後再試');
      setStage('idle');
    }
  }

  function handleReset() {
    setStage('idle');
    setResult(null);
    setStoreName('');
    setErrorMsg(null);
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
            正在抓 {storeName} 的同區對手⋯
          </h2>
          <p className="text-sm text-slate-600">
            掃同產業前 3 名 + 算六維度分數，
            <br />
            最後輸出一張雷達圖 + 攻防建議。
          </p>
        </div>
      </section>
    );
  }

  if (stage === 'done' && result) {
    return (
      <CompetitorResults
        storeName={storeName}
        result={result}
        onReset={handleReset}
      />
    );
  }

  return <CompetitorHero onSubmit={handleSubmit} errorMsg={errorMsg} />;
}
