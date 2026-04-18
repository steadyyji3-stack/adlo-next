'use client';

import { useEffect } from 'react';
import { trackInteraction } from '@/lib/gtm';

/**
 * adlo ClickTracker｜Kael 2026-04-18
 * 全站監聽 [data-gtm-event] 元素的點擊，自動上拋 adlo_interaction 事件。
 * 使用者只要在任何元素加上 data-gtm-event="line_click" 就會自動追蹤。
 */
export default function ClickTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest<HTMLElement>('[data-gtm-event]');
      if (!el) return;
      const name = el.dataset.gtmEvent;
      if (!name) return;

      const extra: Record<string, string> = {};
      // 收集其他 data-gtm-* 屬性作為 payload
      Object.entries(el.dataset).forEach(([k, v]) => {
        if (k.startsWith('gtm') && k !== 'gtmEvent' && typeof v === 'string') {
          const key = k.replace(/^gtm/, '').replace(/^[A-Z]/, c => c.toLowerCase());
          extra[key] = v;
        }
      });

      // 若是 <a> 標籤，額外帶 link_url
      if (el.tagName === 'A') {
        const href = (el as HTMLAnchorElement).href;
        if (href) extra.link_url = href;
      }

      trackInteraction(name, extra);
    }

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
