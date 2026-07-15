'use client';

import { useState } from 'react';
import AdWasteHero from './AdWasteHero';
import AdWasteResults from './AdWasteResults';
import { analyzeAdWaste, type AdWasteInput, type AdWasteResult } from '@/lib/ad-waste';

export default function AdWasteFlow() {
  const [result, setResult] = useState<AdWasteResult | null>(null);
  const [industry, setIndustry] = useState('');

  function handleSubmit(input: AdWasteInput) {
    setIndustry(input.industry);
    setResult(analyzeAdWaste(input));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleReset() {
    setResult(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (result) {
    return <AdWasteResults industry={industry} result={result} onReset={handleReset} />;
  }

  return <AdWasteHero onSubmit={handleSubmit} />;
}
