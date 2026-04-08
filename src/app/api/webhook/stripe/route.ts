import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { Resend } from 'resend';
import type Stripe from 'stripe';

/* Stripe webhook 必須讀取 raw body，Next.js 預設不解析 */
export const runtime = 'nodejs';

/* 惰性初始化，避免 build 時 env 未設定拋錯 */
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY 未設定');
  return new Resend(key);
}

/* ── 歡迎信 HTML ────────────────────────────────────────────── */
function welcomeEmail(planName: string, customerName: string) {
  const name = customerName || '您好';
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
      <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px;">🎉 ${name}，歡迎加入！</h2>
      <p style="color:#475569;line-height:1.7;">
        你已成功訂閱 <strong style="color:#1D9E75;">${planName}</strong>，感謝你的信任。
      </p>
      <p style="color:#475569;line-height:1.7;">
        我們會在 <strong>1–2 個工作天內</strong>主動聯繫你，確認需求並開始進行初步競爭分析。
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="color:#166534;font-weight:bold;margin:0 0 8px;">📋 接下來的步驟</p>
        <ol style="color:#15803d;margin:0;padding-left:20px;line-height:2;">
          <li>我們主動寄送 Onboarding 問卷（商家資訊收集）</li>
          <li>安排 20 分鐘視訊說明會</li>
          <li>開始執行第一個月優化計畫</li>
        </ol>
      </div>
      <p style="color:#64748b;font-size:14px;">
        有任何問題，直接回覆這封信，或寄到
        <a href="mailto:hello@adlo.tw" style="color:#1D9E75;">hello@adlo.tw</a>
      </p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">adlo — adlo.tw</p>
    </div>
  </div>
</body>
</html>`;
}

/* ── Webhook 處理 ────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] 簽名驗證失敗', err);
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  /* ── 處理事件 ─────────────────────────────────────────────── */
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { planName, customerName } = session.metadata ?? {};
      const email = session.customer_email ?? '';

      console.log(`[Stripe] 付款成功 — ${email} 購買 ${planName}`);

      /* 1. 發送歡迎信給客戶 */
      if (email && planName) {
        await getResend().emails.send({
          from: 'adlo 系統通知 <hello@adlo.tw>',
          to:   email,
          subject: `🎉 歡迎加入 adlo — ${planName}訂閱確認`,
          html:  welcomeEmail(planName, customerName ?? ''),
        });
      }

      /* 2. 通知內部（你自己的 Gmail）*/
      await getResend().emails.send({
        from:    'adlo 系統通知 <hello@adlo.tw>',
        to:      'adlo.hello.tw@gmail.com',
        subject: `💰 新訂單成立 — ${planName}（${email}）`,
        html: `<p><strong>方案：</strong>${planName}</p>
               <p><strong>客戶信箱：</strong>${email}</p>
               <p><strong>客戶姓名：</strong>${customerName ?? '未填'}</p>
               <p><strong>Session ID：</strong>${session.id}</p>`,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[Stripe] 訂閱取消 — ${sub.id}`);
      /* TODO: 記錄取消紀錄、停止服務流程 */
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`[Stripe] 付款失敗 — ${invoice.customer_email}`);
      /* TODO: 發送付款失敗通知信 */
      break;
    }

    default:
      console.log(`[Stripe Webhook] 未處理事件: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
