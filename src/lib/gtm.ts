/**
 * adlo GTM helper｜Kael 2026-04-18
 * 統一 dataLayer 事件介面，Ada 規劃的 10 個事件都透過這裡上拋。
 *
 * Event naming convention:
 *   - adlo_interaction：通用連結點擊（LINE/email/social/CTA），interaction_name 帶細節
 *   - contact_form_submit：諮詢表單成功送出
 *   - pricing_plan_click：定價方案按鈕點擊
 *   - scroll_75：文章讀到 75%（GTM 內建 Scroll Depth 觸發）
 */

type EventParams = Record<string, string | number | boolean | undefined | null>;

interface DataLayerEvent extends EventParams {
  event: string;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

/** 安全推送事件到 dataLayer（SSR safe） */
export function pushEvent(event: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

/** 定價方案點擊 */
export function trackPricingClick(planId: string, billing: 'monthly' | 'yearly') {
  pushEvent('pricing_plan_click', { plan_id: planId, billing });
}

/** 諮詢表單成功送出 */
export function trackContactSubmit(params: {
  form_id: number | string;
  industry?: string;
  service?: string;
  challenges_count?: number;
}) {
  pushEvent('contact_form_submit', params);
}

/** 通用互動（搭配 data-gtm-event 屬性自動觸發） */
export function trackInteraction(name: string, extra: EventParams = {}) {
  pushEvent('adlo_interaction', { interaction_name: name, ...extra });
}
