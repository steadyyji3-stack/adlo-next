'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import CompetitorHero from './CompetitorHero';
import CompetitorResults from './CompetitorResults';
import {
  type CompetitorInput,
  type CompetitorResult,
  type StoreScore,
  type DimensionScores,
} from './mock-data';

type Stage = 'idle' | 'loading' | 'done';

/** API response shape — 對應 src/lib/competitor.ts CompetitorReport */
interface ApiScoredStore {
  storeName: string;
  location: string;
  isYou: boolean;
  overall: number;
  breakdown: DimensionScores;
  highlight: string;
  weakness: string;
}

interface ApiResponse {
  you?: ApiScoredStore;
  competitors?: ApiScoredStore[];
  insight?: string;
  query?: string;
  yourStoreInResults?: boolean;
  error?: string;
  message?: string;
  quota?: { count: number; limit: number; emailUnlocked: boolean };
}

/** API → UI 結構轉換（breakdown → dimensions） */
function apiToResult(data: ApiResponse, inputCity: string): CompetitorResult | null {
  if (!data.you || !Array.isArray(data.competitors)) return null;
  const toUi = (s: ApiScoredStore): StoreScore => ({
    storeName: s.storeName,
    location: s.location,
    isYou: s.isYou,
    dimensions: s.breakdown,
    overall: s.overall,
    highlight: s.highlight,
    weakness: s.weakness,
  });
  return {
    you: toUi(data.you),
    competitors: data.competitors.map(toUi),
    insight: data.insight ?? '',
    yourStoreInResults: data.yourStoreInResults,
    inputCity,
    query: data.query,
  };
}

export default function CompetitorFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [storeName, setStoreName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(input: CompetitorInput) {
    setErrorMsg(null);
    setStage('loading');
    setStoreName(input.storeName);

    try {
      const res = await fetch('/api/competitor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as ApiResponse;

      if (!res.ok) {
        setErrorMsg(data.message ?? data.error ?? '比較失敗，請稍後再試');
        setStage('idle');
        return;
      }

      const ui = apiToResult(data, input.city);
      if (!ui) {
        setErrorMsg('回應格式異常，請再試一次');
        setStage('idle');
        return;
      }

      setResult(ui);
      setStage('done');
    } catch (err) {
      console.error('[competitor] API 失敗', err);
      setErrorMsg('連線失敗，請稍後再試');
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
            打 Google 地圖的「{storeName}」 + 同區關鍵字搜尋前 3 名，
            <br />
            算六維度分數 + 攻防建議。
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
