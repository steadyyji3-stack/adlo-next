'use client';

import { useEffect, useRef } from 'react';

interface TrendsWidgetProps {
  containerId: string;
  keywords: string[];
}

declare global {
  interface Window {
    trends?: {
      embed: {
        renderExploreWidgetTo: (
          el: HTMLElement,
          type: string,
          comparisonItem: object,
          controlConfig: object
        ) => void;
      };
    };
  }
}

export default function TrendsWidget({ containerId, keywords }: TrendsWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
      if (!ref.current || !window.trends?.embed) return;
      ref.current.innerHTML = '';
      try {
        window.trends.embed.renderExploreWidgetTo(
          ref.current,
          'TIMESERIES',
          {
            comparisonItem: keywords.map((kw) => ({ keyword: kw, geo: 'TW', time: 'today 12-m' })),
            category: 0,
            property: '',
          },
          {
            exploreQuery:
              keywords.map((kw) => 'q=' + encodeURIComponent(kw)).join('&') +
              '&geo=TW&date=today%2012-m',
            guestPath: 'https://trends.google.com:443/trends/embed/',
          }
        );
      } catch {
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-center py-10 text-slate-500 text-sm">
            <p class="mb-3">⚠️ Google Trends 嵌入載入失敗</p>
            <a href="https://trends.google.com/trends/explore?geo=TW&q=${keywords.map(encodeURIComponent).join('%2C')}"
              target="_blank" rel="noopener"
              class="text-amber-700 hover:underline font-medium">
              在 Google Trends 上直接查看 →
            </a>
          </div>`;
        }
      }
    };

    // Script may already be loaded
    if (window.trends?.embed) {
      render();
    } else {
      const existing = document.getElementById('trends-embed-script');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'trends-embed-script';
        script.src = 'https://ssl.gstatic.com/trends_nrtr/3826_RC01/embed_loader.js';
        script.async = true;
        script.onload = render;
        document.head.appendChild(script);
      } else {
        // Script exists, wait for it
        const check = setInterval(() => {
          if (window.trends?.embed) {
            clearInterval(check);
            render();
          }
        }, 200);
        return () => clearInterval(check);
      }
    }
  }, [keywords]);

  return (
    <div
      ref={ref}
      id={containerId}
      className="min-h-[320px] flex items-center justify-center bg-slate-50 rounded-b-xl p-4"
    >
      <p className="text-slate-400 text-sm">載入 Google Trends 中…</p>
    </div>
  );
}
