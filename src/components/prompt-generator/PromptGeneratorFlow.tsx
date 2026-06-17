'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PromptGeneratorHero, { type PromptFormValue } from './PromptGeneratorHero';
import PromptGeneratorResults from './PromptGeneratorResults';
import type {
  PromptBreakdownItem,
  PromptVariant,
} from '@/lib/groq';

type Stage = 'idle' | 'loading' | 'done';

interface ApiResponse {
  mainPrompt?: string;
  breakdown?: PromptBreakdownItem[];
  variants?: PromptVariant[];
  tips?: string[];
  error?: string;
  message?: string;
  quota?: { count: number; limit: number; emailUnlocked: boolean };
}

export default function PromptGeneratorFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [mainPrompt, setMainPrompt] = useState('');
  const [breakdown, setBreakdown] = useState<PromptBreakdownItem[]>([]);
  const [variants, setVariants] = useState<PromptVariant[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [useCase, setUseCase] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(input: PromptFormValue) {
    setErrorMsg(null);
    setStage('loading');
    setUseCase(input.useCase);

    try {
      const res = await fetch('/api/prompt-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok) {
        setErrorMsg(data.message ?? data.error ?? '產生失敗，請稍後再試');
        setStage('idle');
        return;
      }

      if (!data.mainPrompt) {
        setErrorMsg('產生結果不完整，請再試一次');
        setStage('idle');
        return;
      }

      setMainPrompt(data.mainPrompt);
      setBreakdown(data.breakdown ?? []);
      setVariants(data.variants ?? []);
      setTips(data.tips ?? []);
      setStage('done');
    } catch (err) {
      console.error('[prompt-generator] API 失敗', err);
      setErrorMsg('連線失敗，請稍後再試');
      setStage('idle');
    }
  }

  function handleReset() {
    setStage('idle');
    setMainPrompt('');
    setBreakdown([]);
    setVariants([]);
    setTips([]);
    setUseCase('');
    setErrorMsg(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (stage === 'loading') {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-white py-20">
        <div className="text-center max-w-sm mx-auto px-6">
          <Loader2 className="w-12 h-12 mx-auto text-[#1D9E75] motion-safe:animate-spin mb-6" aria-hidden />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            正在幫你寫提示詞…
          </h2>
          <p className="text-sm text-slate-600">
            一個建議版 + 兩個替代版 + 拆解教學。
            <br />大約 5–10 秒。
          </p>
        </div>
      </section>
    );
  }

  if (stage === 'done') {
    return (
      <PromptGeneratorResults
        mainPrompt={mainPrompt}
        breakdown={breakdown}
        variants={variants}
        tips={tips}
        useCase={useCase}
        onReset={handleReset}
      />
    );
  }

  return (
    <>
      <PromptGeneratorHero onSubmit={handleSubmit} />
      {errorMsg && (
        <div className="max-w-2xl mx-auto px-6 -mt-4 pb-6">
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
            {errorMsg}
          </p>
        </div>
      )}
    </>
  );
}
