import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, getPlanById, SUBSCRIPTION_TRIAL_PERIOD_DAYS } from '@/lib/stripe';

const checkoutRequestSchema = z.object({
  planId: z.string().min(1),
  billing: z.enum(['monthly', 'yearly']).default('monthly'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().trim().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? '結帳資料格式錯誤' }, { status: 400 });
    }

    const { planId, billing, customerEmail, customerName } = parsed.data;

    /* ── 驗證方案 ───────────────────────────────────────────── */
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: '無效的方案' }, { status: 400 });
    }

    const priceId = billing === 'yearly'
      ? plan.stripePriceYearly
      : plan.stripePriceMonthly;

    if (!priceId) {
      return NextResponse.json(
        { error: '此方案的 Stripe Price ID 尚未設定' },
        { status: 500 }
      );
    }

    /* ── 建立 Stripe Checkout Session ───────────────────────── */
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? req.headers.get('origin') ?? 'https://adlo.tw';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      currency: 'twd',
      customer_email: customerEmail,
      metadata: {
        planId,
        billing,
        planName: plan.name,
        customerName: customerName ?? '',
        trialDays: String(SUBSCRIPTION_TRIAL_PERIOD_DAYS),
        offer: 'first_month_free',
      },
      subscription_data: {
        metadata: {
          planId,
          billing,
          planName: plan.name,
          trialDays: String(SUBSCRIPTION_TRIAL_PERIOD_DAYS),
          offer: 'first_month_free',
        },
        trial_period_days: SUBSCRIPTION_TRIAL_PERIOD_DAYS,
      },
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/payment/cancel?plan=${planId}`,
      locale: 'zh',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Checkout Error]', err);
    return NextResponse.json(
      { error: '建立結帳頁面失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
