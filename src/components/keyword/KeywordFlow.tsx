'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import KeywordHero from './KeywordHero';
import KeywordResults from './KeywordResults';
import {
  mockAnalyzeKeywords,
  type KeywordInput,
  type KeywordResult,
} from './mock-data';

type Stage = 'idle' | 'loading' | 'done';

export default function KeywordFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(input: KeywordInput) {
    setErrorMsg(null);
    setStage('loading');

    // Path C：mock 模擬真實 API 的延遲（每組 ~0.3s）
    await new Promise((r) =>
      setTimeout(r, 1500 + input.keywords.length * 200),
    );

    try {
      const out = mockAnalyzeKeywords(input);
      setResults(out);
      setStage('done');
    } catch (err) {
      console.error('[keyword] mock 失敗', err);
      setErrorMsg('分析失敗，請稍後再試');
      setStage('idle');
    }
  }

  function handleReset() {
    setStage('idle');
    setResults([]);
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
            正在分析這些關鍵字⋯
          </h2>
          <p className="text-sm text-slate-600">
            算搜尋量、SEO 難度、CPC，
            <br />
            再決定每組該 SEO、跑廣告、還是跳過。
          </p>
        </div>
      </section>
    );
  }

  if (stage === 'done') {
    return <KeywordResults results={results} onReset={handleReset} />;
  }

  return <KeywordHero onSubmit={handleSubmit} errorMsg={errorMsg} />;
}
