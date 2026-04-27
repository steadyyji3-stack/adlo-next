'use client';

import { useState, useCallback } from 'react';
import CheckHero from './CheckHero';
import CheckLoading from './CheckLoading';
import CheckScore from './CheckScore';
import CheckShareCards from './CheckShareCards';
import CheckEmailGate from './CheckEmailGate';
import {
  trackCheckSubmit,
  trackCheckResult,
  trackCheckRateLimited,
} from '@/lib/gtm';

export type Stage = 'input' | 'loading' | 'result';

export interface CheckResult {
  storeName: string;
  location: string;
  score: number;
  breakdown: {
    profile: number;
    reviews: number;
    reply: number;
    photos: number;
    keywords: number;
    local: number;
  };
  weakestMetric: string;
  regionRankPercent: number;
}

const TRY_COUNT_KEY = 'adlo_check_count';
const EMAIL_UNLOCKED_KEY = 'adlo_check_email_unlocked';

function getLocalCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(TRY_COUNT_KEY) || '0', 10);
}

function getEmailUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(EMAIL_UNLOCKED_KEY) === '1';
}

/** 階段式 loading 文案節奏（與 CheckLoading 對齊，至少 ~4s） */
const MIN_LOADING_MS = 4200;

export default function CheckFlow() {
  const [stage, setStage] = useState<Stage>('input');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runCheck = useCallback(async (query: string) => {
    setStage('loading');
    setErrorMsg(null);
    trackCheckSubmit(query.length);

    // 確保 loading 體驗不會太快閃過
    const startedAt = Date.now();

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (res.status === 429) {
        // 伺服器端額度用完 → 開啟 email gate
        trackCheckRateLimited('server');
        setStage('input');
        setPendingQuery(query);
        setShowEmailGate(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '查詢失敗，請稍後再試');
      }

      const data: CheckResult & {
        quota?: { count: number; limit: number; emailUnlocked: boolean };
      } = await res.json();

      // 確保至少跑完動畫
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }

      // 同步 local 計數（僅 UX，rate limit 以 server 為準）
      if (data.quota) {
        localStorage.setItem(TRY_COUNT_KEY, String(data.quota.count));
        if (data.quota.emailUnlocked) {
          localStorage.setItem(EMAIL_UNLOCKED_KEY, '1');
        }
      } else {
        localStorage.setItem(TRY_COUNT_KEY, String(getLocalCount() + 1));
      }

      setResult({
        storeName: data.storeName,
        location: data.location,
        score: data.score,
        breakdown: data.breakdown,
        weakestMetric: data.weakestMetric,
        regionRankPercent: data.regionRankPercent,
      });
      trackCheckResult({
        score: data.score,
        weakest_metric: data.weakestMetric,
        region_rank_percent: data.regionRankPercent,
        location: data.location,
      });
      setStage('result');
    } catch (err) {
      console.error('[check] 查詢錯誤', err);
      setErrorMsg(err instanceof Error ? err.message : '查詢失敗，請稍後再試');
      setStage('input');
    }
  }, []);

  const handleSubmit = useCallback(
    async (query: string) => {
      // 客端快速判斷 — 真正 gating 交給 server
      const count = getLocalCount();
      const emailUnlocked = getEmailUnlocked();
      const limit = emailUnlocked ? 10 : 3;

      if (count >= limit) {
        trackCheckRateLimited('client');
        setPendingQuery(query);
        setShowEmailGate(true);
        return;
      }

      await runCheck(query);
    },
    [runCheck],
  );

  const handleReset = useCallback(() => {
    setStage('input');
    setResult(null);
    setErrorMsg(null);
  }, []);

  const handleEmailUnlock = useCallback(async () => {
    localStorage.setItem(EMAIL_UNLOCKED_KEY, '1');
    localStorage.setItem(TRY_COUNT_KEY, '0');
    setShowEmailGate(false);

    // 解鎖後若有待查詢 → 自動續跑
    if (pendingQuery) {
      const q = pendingQuery;
      setPendingQuery('');
      await runCheck(q);
    }
  }, [pendingQuery, runCheck]);

  return (
    <>
      {stage === 'input' && <CheckHero onSubmit={handleSubmit} errorMsg={errorMsg} />}
      {stage === 'loading' && <CheckLoading />}
      {stage === 'result' && result && (
        <div className="bg-gradient-to-b from-emerald-50 via-white to-white">
          <CheckScore result={result} onReset={handleReset} />
          <CheckShareCards result={result} />
        </div>
      )}
      <CheckEmailGate
        open={showEmailGate}
        onUnlock={handleEmailUnlock}
        onClose={() => setShowEmailGate(false)}
      />
    </>
  );
}
