import 'server-only';

import { Resend } from 'resend';
import type { Customer } from '@/lib/customers';

type BillingEmailCustomer = Pick<Customer, 'id' | 'email' | 'name' | 'store_name'>;

export type BillingLifecycleMessage =
  | { type: 'payment_attention_required'; invoiceId: string }
  | { type: 'payment_recovered'; invoiceId: string }
  | { type: 'trial_ending'; subscriptionId: string; trialEndsAt: string }
  | { type: 'cancellation_scheduled'; subscriptionId: string; accessUntil: string }
  | { type: 'subscription_ended'; subscriptionId: string; endedAt: string };

interface EmailContent {
  subject: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer: string;
}

export async function sendBillingLifecycleEmail(
  customer: BillingEmailCustomer,
  message: BillingLifecycleMessage,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is required for billing lifecycle email');

  const content = buildEmailContent(customer, message);
  const response = await new Resend(key).emails.send(
    {
      from: 'adlo 系統通知 <hello@adlo.tw>',
      to: customer.email,
      subject: content.subject,
      html: renderHtml(customer, content),
      text: renderText(customer, content),
    },
    { idempotencyKey: idempotencyKey(message) },
  );

  if (response.error) throw new Error('Resend billing lifecycle email failed');
  return response.data.id;
}

function buildEmailContent(customer: BillingEmailCustomer, message: BillingLifecycleMessage): EmailContent {
  const storeName = emailSubjectName(customer.store_name);
  const billingUrl = new URL('/customer/billing', siteUrl()).toString();

  switch (message.type) {
    case 'payment_attention_required':
      return {
        subject: `${storeName}：訂閱付款需要處理`,
        heading: '請完成付款處理',
        body: '本期訂閱付款需要你處理，可能是付款方式需要更新，或銀行要求完成驗證。你的服務目前仍在付款寬限期間，不需要重新訂閱；請前往 Stripe Customer Portal 完成付款處理。',
        ctaLabel: '處理付款',
        ctaUrl: billingUrl,
        footer: '為了避免服務在寬限期結束後暫停，請儘早完成處理。',
      };
    case 'payment_recovered':
      return {
        subject: `${storeName}：付款已恢復，訂閱繼續有效`,
        heading: '付款已恢復',
        body: 'Stripe 已確認這期款項付款成功，你的 adlo 訂閱會繼續有效，不需要再進行其他操作。',
        ctaLabel: '查看訂閱狀態',
        ctaUrl: billingUrl,
        footer: '感謝你完成付款資料更新。',
      };
    case 'trial_ending':
      return {
        subject: `${storeName}：首月免費即將結束`,
        heading: '首月免費即將結束',
        body: `你的首月免費將於 ${formatDate(message.trialEndsAt)} 結束。若繼續訂閱，Stripe 會在試用結束後使用已儲存的付款方式扣款；你也可以在結束前前往 Stripe Customer Portal 取消。`,
        ctaLabel: '管理訂閱',
        ctaUrl: billingUrl,
        footer: '你可以隨時管理訂閱，不需要聯絡客服。',
      };
    case 'cancellation_scheduled':
      return {
        subject: `${storeName}：已排定在本期結束時取消訂閱`,
        heading: '取消排程已確認',
        body: `你的訂閱已排定在 ${formatDate(message.accessUntil)} 結束。結束日前仍可使用服務，也可以回到 Stripe Customer Portal 取消這個排程並繼續訂閱。`,
        ctaLabel: '管理訂閱',
        ctaUrl: billingUrl,
        footer: '本期結束後不會再自動續訂。',
      };
    case 'subscription_ended':
      return {
        subject: `${storeName}：adlo 訂閱已結束`,
        heading: '訂閱已結束',
        body: `你的 adlo 訂閱已於 ${formatDate(message.endedAt)} 結束，之後不會再自動扣款。`,
        ctaLabel: '查看訂閱紀錄',
        ctaUrl: billingUrl,
        footer: '客戶歷史資料仍會依 adlo 的資料保留政策處理。',
      };
  }
}

function renderHtml(customer: BillingEmailCustomer, content: EmailContent) {
  const name = escapeHtml(customer.name || customer.store_name);
  const heading = escapeHtml(content.heading);
  const body = escapeHtml(content.body);
  const footer = escapeHtml(content.footer);
  const cta = content.ctaLabel && content.ctaUrl
    ? `<p style="margin:28px 0;"><a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;background:#1D9E75;color:#ffffff;text-decoration:none;padding:13px 20px;font-weight:700;">${escapeHtml(content.ctaLabel)}</a></p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8" /><title>${heading}</title></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;">
    <div style="background:#0d2b20;padding:28px 32px;">
      <p style="color:#a7f3d0;font-size:13px;font-weight:700;margin:0 0 8px;">adlo 訂閱通知</p>
      <h1 style="color:#ffffff;font-size:24px;line-height:1.35;margin:0;">${heading}</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#334155;font-size:16px;line-height:1.75;margin:0 0 16px;">${name} 您好，</p>
      <p style="color:#475569;font-size:16px;line-height:1.75;margin:0;">${body}</p>
      ${cta}
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">${footer}</p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 32px;">
      <p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0;">需要協助請回覆此信，或寄到 hello@adlo.tw。</p>
    </div>
  </div>
</body>
</html>`;
}

function renderText(customer: BillingEmailCustomer, content: EmailContent) {
  return [
    `${customer.name || customer.store_name} 您好，`,
    '',
    content.heading,
    content.body,
    content.ctaUrl ? `${content.ctaLabel}：${content.ctaUrl}` : '',
    '',
    content.footer,
    '需要協助請回覆此信，或寄到 hello@adlo.tw。',
  ].filter(Boolean).join('\n');
}

function idempotencyKey(message: BillingLifecycleMessage) {
  switch (message.type) {
    case 'payment_attention_required':
      return `billing/payment-attention/${message.invoiceId}`;
    case 'payment_recovered':
      return `billing/payment-recovered/${message.invoiceId}`;
    case 'trial_ending':
      return `billing/trial-ending/${message.subscriptionId}/${message.trialEndsAt.slice(0, 10)}`;
    case 'cancellation_scheduled':
      return `billing/cancel-scheduled/${message.subscriptionId}/${message.accessUntil.slice(0, 10)}`;
    case 'subscription_ended':
      return `billing/subscription-ended/${message.subscriptionId}`;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Taipei',
  });
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adlo.tw';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}

function emailSubjectName(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim() || '你的店家';
}
