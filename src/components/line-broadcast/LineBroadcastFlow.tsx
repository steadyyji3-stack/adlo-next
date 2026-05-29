'use client';

import { useState } from 'react';
import LineBroadcastHero from './LineBroadcastHero';
import LineBroadcastResults from './LineBroadcastResults';
import { generateBroadcasts, type GeneratedBroadcast, type LineBroadcastInput } from '@/lib/line-broadcast';

type Stage = 'idle' | 'done';

export default function LineBroadcastFlow() {
  const [stage, setStage] = useState<Stage>('idle');
  const [storeName, setStoreName] = useState('');
  const [broadcasts, setBroadcasts] = useState<GeneratedBroadcast[]>([]);

  function handleSubmit(input: LineBroadcastInput) {
    setStoreName(input.storeName);
    setBroadcasts(generateBroadcasts(input));
    setStage('done');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleReset() {
    setStage('idle');
    setStoreName('');
    setBroadcasts([]);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (stage === 'done') {
    return (
      <LineBroadcastResults
        storeName={storeName}
        broadcasts={broadcasts}
        onReset={handleReset}
      />
    );
  }

  return <LineBroadcastHero onSubmit={handleSubmit} />;
}
