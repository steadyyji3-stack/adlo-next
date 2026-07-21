import 'server-only';

import { Resend } from 'resend';
import { writeAuditLog } from '@/lib/audit-log';
import { currentTaipeiGrowthWeekStart } from '@/lib/customer-growth-cycles';
import { selectRows } from '@/lib/supabase-rest';

const DIGEST_ACTION = 'customer.weekly_digest.sent';
const SEND_INTERVAL_MS = 600;

interface DigestCustomerRow {
  id: string;
  email: string;
  name: string;
  store_name: string;
}

interface DigestSubscriptionRow {
  customer_id: string;
}

interface CustomerStoreProfileRow {
  customer_id: string;
}

interface CurrentGrowthCycleRow {
  customer_id: string;
}

interface DigestAuditRow {
  target_id: string | null;
  payload: Record<string, unknown> | null;
}

export interface WeeklyDigestResult {
  weekStart: string;
  considered: number;
  eligible: number;
  sent: number;
  failed: number;
  skipped: {
    profileRequired: number;
    currentTaskExists: number;
    alreadySent: number;
  };
}

export async function runCustomerWeeklyDigest(now = new Date()): Promise<WeeklyDigestResult> {
  const weekStart = currentTaipeiGrowthWeekStart(now);
  const [
    customers,
    activeSubscriptions,
    trialingSubscriptions,
    pastDueSubscriptions,
    profiles,
    currentCycles,
    sentAudits,
  ] = await Promise.all([
    selectRows<DigestCustomerRow>('customers', undefined, {
      select: 'id,email,name,store_name',
      order: 'created_at.asc',
    }),
    selectRows<DigestSubscriptionRow>('subscriptions', { status: 'active' }, { select: 'customer_id' }),
    selectRows<DigestSubscriptionRow>('subscriptions', { status: 'trialing' }, { select: 'customer_id' }),
    selectRows<DigestSubscriptionRow>('subscriptions', { status: 'past_due' }, { select: 'customer_id' }),
    selectRows<CustomerStoreProfileRow>('customer_store_profiles', undefined, { select: 'customer_id' }),
    selectRows<CurrentGrowthCycleRow>('customer_growth_cycles', { week_start: weekStart }, { select: 'customer_id' }),
    selectRows<DigestAuditRow>('audit_log', { actor: 'system:weekly-digest', action: DIGEST_ACTION }, {
      select: 'target_id,payload',
      order: 'created_at.desc',
      limit: 1000,
    }),
  ]);

  const activeCustomerIds = new Set([
    ...activeSubscriptions.map((subscription) => subscription.customer_id),
    ...trialingSubscriptions.map((subscription) => subscription.customer_id),
    ...pastDueSubscriptions.map((subscription) => subscription.customer_id),
  ]);
  const profileCustomerIds = new Set(profiles.map((profile) => profile.customer_id));
  const currentCycleCustomerIds = new Set(currentCycles.map((cycle) => cycle.customer_id));
  const sentCustomerIds = new Set(
    sentAudits
      .filter((audit) => audit.payload?.week_start === weekStart)
      .map((audit) => audit.target_id)
      .filter((customerId): customerId is string => Boolean(customerId)),
  );
  const activeCustomers = customers.filter((customer) => activeCustomerIds.has(customer.id));
  const eligibleCustomers = activeCustomers.filter((customer) =>
    profileCustomerIds.has(customer.id)
      && !currentCycleCustomerIds.has(customer.id)
      && !sentCustomerIds.has(customer.id),
  );

  let sent = 0;
  let failed = 0;
  for (const [index, customer] of eligibleCustomers.entries()) {
    try {
      const messageId = await sendWeeklyDigest(customer, weekStart);
      await writeAuditLog({
        actor: 'system:weekly-digest',
        action: DIGEST_ACTION,
        targetType: 'customer',
        targetId: customer.id,
        payload: {
          week_start: weekStart,
          provider_message_id: messageId,
        },
      });
      sent += 1;
    } catch {
      failed += 1;
    }

    if (index < eligibleCustomers.length - 1) {
      await delay(SEND_INTERVAL_MS);
    }
  }

  return {
    weekStart,
    considered: activeCustomers.length,
    eligible: eligibleCustomers.length,
    sent,
    failed,
    skipped: {
      profileRequired: activeCustomers.filter((customer) => !profileCustomerIds.has(customer.id)).length,
      currentTaskExists: activeCustomers.filter((customer) => currentCycleCustomerIds.has(customer.id)).length,
      alreadySent: activeCustomers.filter((customer) => sentCustomerIds.has(customer.id)).length,
    },
  };
}

async function sendWeeklyDigest(customer: DigestCustomerRow, weekStart: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is required for weekly digest');

  const response = await new Resend(key).emails.send(
    {
      from: 'adlo 系統通知 <hello@adlo.tw>',
      to: customer.email,
      subject: `${emailSubjectName(customer.store_name)}：本週成長任務入口已開啟`,
      html: weeklyDigestEmail(customer),
    },
    {
      idempotencyKey: `weekly-growth/${weekStart}/${customer.id}`,
    },
  );

  if (response.error) throw new Error('Resend weekly digest failed');
  return response.data.id;
}

function weeklyDigestEmail(customer: DigestCustomerRow) {
  const taskUrl = new URL('/customer/week', siteUrl());
  taskUrl.searchParams.set('generate', '1');
  const billingUrl = new URL('/customer/billing', siteUrl());
  const name = escapeHtml(customer.name || customer.store_name);
  const storeName = escapeHtml(customer.store_name);

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8" /><title>你的本週成長任務</title></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;">
    <div style="background:#0d2b20;padding:28px 32px;">
      <p style="color:#a7f3d0;font-size:13px;font-weight:700;letter-spacing:0;margin:0 0 8px;">adlo 每週成長任務</p>
      <h1 style="color:#ffffff;font-size:24px;line-height:1.35;margin:0;">${storeName}，這週只做一件事</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#334155;font-size:16px;line-height:1.75;margin:0 0 16px;">${name} 您好，</p>
      <p style="color:#475569;font-size:16px;line-height:1.75;margin:0 0 16px;">本週任務入口已開啟。系統會依你的店家檔案與前幾週紀錄，準備一件約 15–30 分鐘可完成的在地成長行動。</p>
      <p style="margin:28px 0;"><a href="${taskUrl.toString()}" style="display:inline-block;background:#1D9E75;color:#ffffff;text-decoration:none;padding:13px 20px;font-weight:700;">取得本週任務</a></p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">不需要記密碼。若登入狀態已到期，系統會請你用訂閱 email 取得一次性登入連結。</p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 32px;">
      <p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0;">這是有效訂閱的每週產品通知。你可以在 <a href="${billingUrl.toString()}" style="color:#64748b;">客戶後台管理或取消訂閱</a>。</p>
    </div>
  </div>
</body>
</html>`;
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

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
