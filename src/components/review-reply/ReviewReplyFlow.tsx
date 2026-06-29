'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ReviewReplyHero, { type ReviewReplyFormValue } from './ReviewReplyHero';
import ReviewReplyResults from './ReviewReplyResults';
import type { ReviewReplyVariant } from '@/lib/groq';

type Stage = 'idle' | 'loading' | 'done';

interface ApiResponse {
  variants?: ReviewReplyVariant[];
  tips?: string[];
  error?: string;
  message?: string;
  quota?: { count: number; limit: number; emailUnlocked: boolean };
}

export default function ReviewReplyFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [variants, setVariants] = useState<ReviewReplyVariant[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(input: ReviewReplyFormValue) {
    setErrorMsg(null);
    setStage('loading');
    setRating(input.rating);

    try {
      const res = await fetch('/api/review-reply/generate', {
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

      if (!data.variants?.length) {
        setErrorMsg('產生結果不完整，請再試一次');
        setStage('idle');
        return;
      }

      setVariants(data.variants);
      setTips(data.tips ?? []);
      setStage('done');
    } catch (err) {
      console.error('[review-reply] API 失敗', err);
      setErrorMsg('連線失敗，請稍後再試');
      setStage('idle');
    }
  }

  function handleReset() {
    setStage('idle');
    setVariants([]);
    setTips([]);
    setErrorMsg(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (stage === 'loading') {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 py-20">
        <div className="text-center max-w-md mx-auto px-6">
          <Loader2 className="w-12 h-12 mx-auto text-[#1D9E75] motion-safe:animate-spin mb-6" aria-hidden />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">正在幫你想怎麼回…</h2>
          <p className="text-sm text-slate-600">
            3 種語氣 × 同一則評論，大約 5 秒。
            <br />
            公開回覆是寫給下一個客人看的——值得花這幾秒。
          </p>
        </div>
      </section>
    );
  }

  if (stage === 'done') {
    return (
      <ReviewReplyResults
        rating={rating}
        variants={variants}
        tips={tips}
        onReset={handleReset}
      />
    );
  }

  return <ReviewReplyHero onSubmit={handleSubmit} errorMsg={errorMsg} />;
}
