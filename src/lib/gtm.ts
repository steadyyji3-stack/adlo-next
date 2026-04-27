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

// ==================== /check 免費健檢事件（Ada × Kael 2026-04-21） ====================

/** 將分數轉為分段標籤，方便 GA4 做區隔分析 */
export function scoreBand(score: number): 'high' | 'mid' | 'low' | 'poor' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  if (score >= 40) return 'low';
  return 'poor';
}

/** /check 使用者送出查詢（不論是否成功） */
export function trackCheckSubmit(queryLength: number) {
  pushEvent('check_submit', { query_length: queryLength });
}

/** /check 成功取得結果（分數 + 最弱指標 + 區域排名） */
export function trackCheckResult(params: {
  score: number;
  weakest_metric: string;
  region_rank_percent: number;
  location?: string;
}) {
  pushEvent('check_result', {
    ...params,
    score_band: scoreBand(params.score),
  });
}

/** /check 觸發 rate limit（客端或 server 端 429） */
export function trackCheckRateLimited(source: 'client' | 'server') {
  pushEvent('check_rate_limited', { source });
}

/** /check Email gate 解鎖成功（L0 收集） */
export function trackCheckEmailUnlock() {
  pushEvent('check_email_unlock', {});
}

/** /check 分享卡點擊（download / share / copy / upgrade） */
export function trackCheckShare(
  action: 'download' | 'share' | 'copy' | 'upgrade_cta',
  params: { score?: number; size?: 'square' | 'story' } = {},
) {
  pushEvent('check_share', {
    share_action: action,
    ...(params.score !== undefined ? { score_band: scoreBand(params.score) } : {}),
    ...(params.size ? { card_size: params.size } : {}),
  });
}

/** /diagnostic R-01 升級 CTA 點擊（哪個區塊觸發） */
export function trackDiagnosticCtaClick(location: string) {
  pushEvent('diagnostic_cta_click', { cta_location: location });
}
