'use client';

import { useState } from 'react';
import PostWriterHero from './PostWriterHero';
import PostWriterResults from './PostWriterResults';
import { Loader2 } from 'lucide-react';
import {
  mockGeneratePosts,
  type GeneratedPost,
  type PostWriterInput,
} from './mock-data';

type Stage = 'idle' | 'loading' | 'done';

export default function PostWriterFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [storeName, setStoreName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(input: PostWriterInput) {
    setErrorMsg(null);
    setStage('loading');
    setStoreName(input.storeName);

    // Path C: mock 2 秒延遲，模擬真實 AI 回應的等待
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const generated = mockGeneratePosts(input);
      setPosts(generated);
      setStage('done');
    } catch (err) {
      console.error('[post-writer] mock 失敗', err);
      setErrorMsg('產生失敗，請稍後再試');
      setStage('idle');
    }
  }

  function handleReset() {
    setStage('idle');
    setPosts([]);
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
          <Loader2 className="w-12 h-12 mx-auto text-[#1D9E75] animate-spin mb-6" aria-hidden />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            正在幫 {storeName} 想下週貼文…
          </h2>
          <p className="text-sm text-slate-600">
            7 篇 × 不同風格，大約 3 秒。
            <br />
            節慶、教育、QA、幕後、促銷、客戶見證、新品 — 一週的骨架。
          </p>
        </div>
      </section>
    );
  }

  if (stage === 'done') {
    return (
      <PostWriterResults
        storeName={storeName}
        posts={posts}
        onReset={handleReset}
      />
    );
  }

  return <PostWriterHero onSubmit={handleSubmit} errorMsg={errorMsg} />;
}
