'use client';

import { useState } from 'react';
import AdBudgetHero from './AdBudgetHero';
import AdBudgetResults from './AdBudgetResults';
import { analyzeAdBudget, type AdBudgetInput, type AdBudgetResult } from '@/lib/ad-budget';

export default function AdBudgetFlow() {
  const [result, setResult] = useState<AdBudgetResult | null>(null);
  const [input, setInput] = useState<AdBudgetInput | null>(null);

  function handleSubmit(value: AdBudgetInput) {
    setInput(value);
    setResult(analyzeAdBudget(value));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleReset() {
    setResult(null);
    setInput(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (result && input) {
    return <AdBudgetResults input={input} result={result} onReset={handleReset} />;
  }

  return <AdBudgetHero onSubmit={handleSubmit} />;
}
