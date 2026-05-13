import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import type Stripe from 'stripe';
import { apiError } from '@/lib/api-response';
import {
  syncExistingSubscription,
  upsertCheckoutCustomer,
  upsertSubscription,
  type PlanId,
  type SubscriptionStatus,
} from '@/lib/customers';
import { getStripe } from '@/lib/stripe';
import { writeAuditLog } from '@/lib/audit-log';

export const stripeWebhookRuntime = 'nodejs';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY 未設定');
  return new Resend(key);
}

function welcomeEmail(planName: string, customerName: string, onboardingUrl?: string) {
  const name = customerName || '您好';
  const onboardingBlock = onboardingUrl
    ? `<p style="margin:24px 0;"><a href="${onboardingUrl}" style="display:inline-block;background:#1D9E75;color:#fff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">填寫 5 分鐘 onboarding 表單</a></p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8" /><title>歡迎加入 adlo</title></head>
<body style="font-family:sans-serif;background:#f8fafc;margin:0;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#0d2b20,#1D9E75);padding:32px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;margin:0;">adlo</h1>
      <p style="color:#a7f3d0;margin:8px 0 0;">在地行銷，讓生意被找到</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px;">${name}，歡迎加入</h2>
      <p style="color:#475569;line-height:1.7;">你已成功訂閱 <strong style="color:#1D9E75;">${planName}</strong>，感謝你的信任。</p>
      <p style="color:#475569;line-height:1.7;">下一步請填寫 onboarding 表單，我們會用這些資料建立你的第一個月執行計畫。</p>
      ${onboardingBlock}
      <p style="color:#64748b;font-size:14px;">有任何問題，直接回覆這封信，或寄到 <a href="mailto:hello@adlo.tw" style="color:#1D9E75;">hello@adlo.tw</a></p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">adlo — adlo.tw</p>
    </div>
  </div>
</body>
</html>`;
}

function toIsoFromUnix(value: number | null | undefined, fallback: Date) {
  return new Date((value ?? Math.floor(fallback.getTime() / 1000)) * 1000).toISOString();
}

function normalizeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === 'canceled') return 'cancelled';
  if (status === 'active' || status === 'trialing' || status === 'past_due' || status === 'incomplete' || status === 'unpaid') {
    return status;
  }
  return 'paused';
}

function normalizePlanId(planId: string | undefined): PlanId {
  return parsePlanId(planId) ?? 'gbp-auto';
}

function parsePlanId(planId: string | undefined): PlanId | undefined {
  if (planId === 'gbp-auto' || planId === 'local-seo' || planId === 'ads-managed' || planId === 'starter' || planId === 'growth' || planId === 'dominate') {
    return planId;
  }
  return undefined;
}

function getSubscriptionPlanId(subscription: Stripe.Subscription): PlanId | undefined {
  const metadataPlanId = parsePlanId(subscription.metadata?.planId);
  if (metadataPlanId) return metadataPlanId;

  const firstItemPlanId = subscription.items.data[0]?.price.metadata?.planId;
  return parsePlanId(firstItemPlanId);
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const periodSource = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  return {
    currentPeriodStart: periodSource.current_period_start,
    currentPeriodEnd: periodSource.current_period_end,
  };
}

function subscriptionSyncInput(subscription: Stripe.Subscription) {
  const fallbackStart = new Date();
  const fallbackEnd = new Date(fallbackStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  const period = getSubscriptionPeriod(subscription);

  return {
    stripeSubscriptionId: subscription.id,
    planId: getSubscriptionPlanId(subscription),
    status: normalizeSubscriptionStatus(subscription.status),
    currentPeriodStart: toIsoFromUnix(period.currentPeriodStart, fallbackStart),
    currentPeriodEnd: toIsoFromUnix(period.currentPeriodEnd, fallbackEnd),
    trialEnd: subscription.trial_end ? toIsoFromUnix(subscription.trial_end, fallbackEnd) : null,
    cancelledAt: subscription.canceled_at ? toIsoFromUnix(subscription.canceled_at, fallbackEnd) : null,
  };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, req: NextRequest) {
  const stripe = getStripe();
  const email = session.customer_email ?? session.customer_details?.email;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!email || !stripeCustomerId || !stripeSubscriptionId) {
    throw new Error('Stripe checkout session missing customer, subscription, or email');
  }

  const metadata = session.metadata ?? {};
  const planId = normalizePlanId(metadata.planId);
  const planName = metadata.planName ?? planId;
  const customerName = metadata.customerName || session.customer_details?.name || email.split('@')[0];
  const customer = await upsertCheckoutCustomer({
    stripeCustomerId,
    email,
    name: customerName,
    storeName: customerName,
  });

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const fallbackStart = new Date();
  const fallbackEnd = new Date(fallbackStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  const period = getSubscriptionPeriod(subscription);

  await upsertSubscription({
    customerId: customer.id,
    stripeSubscriptionId,
    planId,
    status: normalizeSubscriptionStatus(subscription.status),
    currentPeriodStart: toIsoFromUnix(period.currentPeriodStart, fallbackStart),
    currentPeriodEnd: toIsoFromUnix(period.currentPeriodEnd, fallbackEnd),
    trialEnd: subscription.trial_end ? toIsoFromUnix(subscription.trial_end, fallbackEnd) : null,
    cancelledAt: subscription.canceled_at ? toIsoFromUnix(subscription.canceled_at, fallbackEnd) : null,
  });

  await writeAuditLog({
    actor: 'system:stripe',
    action: 'stripe.checkout.completed',
    targetType: 'customer',
    targetId: customer.id,
    payload: {
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      plan_id: planId,
      checkout_session_id: session.id,
    },
  });

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adlo.tw';
  const onboardingUrl = `${origin}/onboarding?customer_id=${customer.id}`;

  await getResend().emails.send({
    from: 'adlo 系統通知 <hello@adlo.tw>',
    to: email,
    subject: `歡迎加入 adlo — ${planName} 訂閱確認`,
    html: welcomeEmail(planName, customerName, onboardingUrl),
  });

  await getResend().emails.send({
    from: 'adlo 系統通知 <hello@adlo.tw>',
    to: 'adlo.hello.tw@gmail.com',
    subject: `新訂單成立 — ${planName}`,
    html: `<p><strong>方案：</strong>${planName}</p>
           <p><strong>客戶信箱：</strong>${email}</p>
           <p><strong>客戶姓名：</strong>${customerName}</p>
           <p><strong>Customer ID：</strong>${customer.id}</p>`,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const syncedSubscription = await syncExistingSubscription({
    ...subscriptionSyncInput(subscription),
    status: 'cancelled',
    cancelledAt: subscription.canceled_at ? toIsoFromUnix(subscription.canceled_at, new Date()) : new Date().toISOString(),
  });

  await writeAuditLog({
    actor: 'system:stripe',
    action: 'stripe.subscription.deleted',
    targetType: 'subscription',
    targetId: syncedSubscription?.id ?? null,
    payload: {
      stripe_subscription_id: subscription.id,
      status: 'cancelled',
      local_subscription_found: Boolean(syncedSubscription),
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const syncedSubscription = await syncExistingSubscription(subscriptionSyncInput(subscription));

  await writeAuditLog({
    actor: 'system:stripe',
    action: 'stripe.subscription.updated',
    targetType: 'subscription',
    targetId: syncedSubscription?.id ?? null,
    payload: {
      stripe_subscription_id: subscription.id,
      status: normalizeSubscriptionStatus(subscription.status),
      local_subscription_found: Boolean(syncedSubscription),
    },
  });
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const source = invoice as Stripe.Invoice & {
    subscription?: string | { id?: string } | null;
  };
  if (typeof source.subscription === 'string') return source.subscription;
  return source.subscription?.id ?? null;
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  const localSubscription = stripeSubscriptionId
    ? await syncExistingSubscription({
      stripeSubscriptionId,
      status: 'past_due',
    })
    : null;

  await writeAuditLog({
    actor: 'system:stripe',
    action: 'stripe.invoice.payment_failed',
    targetType: 'subscription',
    targetId: localSubscription?.id ?? null,
    payload: {
      stripe_subscription_id: stripeSubscriptionId,
      invoice_id: invoice.id,
      local_subscription_found: Boolean(localSubscription),
    },
  });
}

export async function handleStripeWebhook(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return apiError('STRIPE_SIGNATURE_INVALID', 'Webhook signature failed', 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, req);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('[Stripe Webhook] handler failed', error instanceof Error ? error.message : 'unknown error');
    return apiError('STRIPE_WEBHOOK_HANDLER_FAILED', 'Stripe webhook handler failed', 500);
  }

  return NextResponse.json({ received: true });
}
