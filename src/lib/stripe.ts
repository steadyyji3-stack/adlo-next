import Stripe from 'stripe';

/* ── Stripe 伺服器端實例（惰性，避免 build 時 env 為空報錯）── */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY 未設定');
    _stripe = new Stripe(key, { apiVersion: '2025-03-31.basil' });
  }
  return _stripe;
}

/** @deprecated 使用 getStripe() */
export const stripe = {
  checkout: { sessions: { create: (...a: Parameters<Stripe['checkout']['sessions']['create']>) => getStripe().checkout.sessions.create(...a) } },
  webhooks: { constructEvent: (...a: Parameters<Stripe['webhooks']['constructEvent']>) => getStripe().webhooks.constructEvent(...a) },
} as unknown as Stripe;

/* ── 方案定義（對應 /pricing 頁三個方案）────────────────────── */
export interface PlanConfig {
  id: string;
  name: string;
  priceMonthly: number;   // NT$，月繳
  priceYearly: number;    // NT$，年繳（月均）
  /** Stripe Price ID — 月繳 */
  stripePriceMonthly: string;
  /** Stripe Price ID — 年繳 */
  stripePriceYearly: string;
  description: string;
}

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: '在地曝光入門',
    priceMonthly: 8800,
    priceYearly: 7400,
    stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    stripePriceYearly:  process.env.STRIPE_PRICE_STARTER_YEARLY  ?? '',
    description: 'Google 商家優化 + 在地 SEO 基礎',
  },
  {
    id: 'growth',
    name: '搜尋成長計畫',
    priceMonthly: 18800,
    priceYearly: 15800,
    stripePriceMonthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? '',
    stripePriceYearly:  process.env.STRIPE_PRICE_GROWTH_YEARLY  ?? '',
    description: 'SEO + 廣告代管 + 月報',
  },
  {
    id: 'dominate',
    name: '市場主導方案',
    priceMonthly: 32800,
    priceYearly: 27800,
    stripePriceMonthly: process.env.STRIPE_PRICE_DOMINATE_MONTHLY ?? '',
    stripePriceYearly:  process.env.STRIPE_PRICE_DOMINATE_YEARLY  ?? '',
    description: 'SEO + 多平台廣告 + 專案經理',
  },
];

export function getPlanById(id: string): PlanConfig | undefined {
  return PLANS.find(p => p.id === id);
}
