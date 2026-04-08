import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanById } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, billing, customerEmail, customerName } = body as {
      planId: string;
      billing: 'monthly' | 'yearly';
      customerEmail?: string;
      customerName?: string;
    };

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
    const origin = req.headers.get('origin') ?? 'https://adlo.tw';

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
      },
      subscription_data: {
        metadata: { planId, billing, planName: plan.name },
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
