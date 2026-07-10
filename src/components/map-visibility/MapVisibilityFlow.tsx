'use client';

import { useState } from 'react';
import MapVisibilityHero from './MapVisibilityHero';
import MapVisibilityResults from './MapVisibilityResults';
import {
  analyzeMapVisibility,
  type MapVisibilityInput,
  type MapVisibilityResult,
} from '@/lib/map-visibility';

export default function MapVisibilityFlow() {
  const [result, setResult] = useState<MapVisibilityResult | null>(null);
  const [ctx, setCtx] = useState<{ city: string; industry: string }>({ city: '', industry: '' });

  function handleSubmit(input: MapVisibilityInput) {
    setCtx({ city: input.city, industry: input.industry });
    setResult(analyzeMapVisibility(input));
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
    return (
      <MapVisibilityResults
        city={ctx.city}
        industry={ctx.industry}
        result={result}
        onReset={handleReset}
      />
    );
  }

  return <MapVisibilityHero onSubmit={handleSubmit} />;
}
