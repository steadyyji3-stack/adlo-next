'use client';

import { useState } from 'react';
import ReviewLinkHero, { type ReviewFormValue } from './ReviewLinkHero';
import ReviewLinkResults from './ReviewLinkResults';

type Stage = 'idle' | 'done';

export default function ReviewLinkFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [value, setValue] = useState<ReviewFormValue | null>(null);

  function handleSubmit(v: ReviewFormValue) {
    setValue(v);
    setStage('done');
  }

  function handleReset() {
    setStage('idle');
    setValue(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (stage === 'done' && value) {
    return (
      <ReviewLinkResults
        storeName={value.storeName}
        industry={value.industry}
        reviewUrl={value.reviewUrl}
        onReset={handleReset}
      />
    );
  }

  return <ReviewLinkHero onSubmit={handleSubmit} />;
}
