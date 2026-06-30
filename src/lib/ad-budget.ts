/**
 * Google Ads 該不該投 — break-even 試算引擎（deterministic，無 API）
 *
 * 定位：直擊「廣告費越燒越貴」痛點。用店家自己的數字算出「每次點擊最多能付多少還不虧」，
 * 並把虧錢的情境導回 adlo 的核心信念——先把免費的 GBP 做起來。
 *
 * 純函式、零外部呼叫、client 端同步執行。
 */

export interface AdBudgetInput {
  avgOrderValue: number; // 客單價 NT$（每筆成交平均收入）
  grossMarginPct: number; // 毛利率 %（0–100，扣成本後、未扣廣告）
  conversionRatePct: number; // 點擊 → 成交 轉換率 %（0–100）
  cpc: number; // 每次點擊成本 NT$
  monthlyBudget?: number; // 選填：每月想投的預算 NT$
}

export type AdVerdict = 'profitable' | 'marginal' | 'loss';

export interface AdBudgetProjection {
  clicks: number;
  conversions: number;
  revenue: number;
  netProfit: number; // 營收 × 毛利率 − 預算
}

export interface AdBudgetResult {
  grossProfitPerSale: number; // 每筆成交毛利
  breakEvenCpa: number; // 損益兩平 CPA（= 每筆毛利）
  breakEvenCpc: number; // 你每次點擊最多能付（= 毛利 × 轉換率）
  breakEvenRoas: number; // 損益兩平 ROAS（= 1 / 毛利率）
  requiredConversionRatePct: number; // 在你填的 CPC 下、不虧所需的轉換率 %
  marginPerClick: number; // 每次點擊期望淨毛利（breakEvenCpc − cpc）
  verdict: AdVerdict;
  projection?: AdBudgetProjection;
}

/** 台灣在地關鍵字 CPC 概估參考（NT$／點），實際以關鍵字工具查詢為準。 */
export const CPC_REFERENCE = [
  { label: '低競爭（一般餐飲、小型在地服務）', range: '約 NT$5–20', mid: 12 },
  { label: '中競爭（美業、寵物、住宿、居家清潔）', range: '約 NT$15–45', mid: 30 },
  { label: '高競爭（醫美、牙醫、律師、補習、保險）', range: '約 NT$40–120+', mid: 70 },
] as const;

const round = (n: number) => Math.round(n);
const round1 = (n: number) => Math.round(n * 10) / 10;

export function analyzeAdBudget(input: AdBudgetInput): AdBudgetResult {
  const margin = input.grossMarginPct / 100;
  const conv = input.conversionRatePct / 100;

  const grossProfitPerSale = input.avgOrderValue * margin;
  const breakEvenCpa = grossProfitPerSale;
  const breakEvenCpc = grossProfitPerSale * conv;
  const breakEvenRoas = margin > 0 ? 1 / margin : Infinity;
  const requiredConversionRatePct =
    grossProfitPerSale > 0 ? (input.cpc / grossProfitPerSale) * 100 : Infinity;
  const marginPerClick = breakEvenCpc - input.cpc;

  // verdict：以「能付的 CPC ÷ 實付 CPC」的餘裕判斷
  const headroom = input.cpc > 0 ? breakEvenCpc / input.cpc : Infinity;
  let verdict: AdVerdict;
  if (headroom >= 1.3) verdict = 'profitable';
  else if (headroom >= 1.0) verdict = 'marginal';
  else verdict = 'loss';

  let projection: AdBudgetProjection | undefined;
  if (input.monthlyBudget && input.monthlyBudget > 0 && input.cpc > 0) {
    const clicks = input.monthlyBudget / input.cpc;
    const conversions = clicks * conv;
    const revenue = conversions * input.avgOrderValue;
    const netProfit = revenue * margin - input.monthlyBudget;
    projection = {
      clicks: round(clicks),
      conversions: round1(conversions),
      revenue: round(revenue),
      netProfit: round(netProfit),
    };
  }

  return {
    grossProfitPerSale: round(grossProfitPerSale),
    breakEvenCpa: round(breakEvenCpa),
    breakEvenCpc: round1(breakEvenCpc),
    breakEvenRoas: Number.isFinite(breakEvenRoas) ? round1(breakEvenRoas) : 0,
    requiredConversionRatePct: Number.isFinite(requiredConversionRatePct)
      ? round1(requiredConversionRatePct)
      : 0,
    marginPerClick: round1(marginPerClick),
    verdict,
    projection,
  };
}
