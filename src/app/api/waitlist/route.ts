import { NextRequest, NextResponse } from 'next/server';
import 'server-only';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const KEY = 'adlo:waitlist';

type Plan = 'gbp-auto' | 'local-seo' | 'ads-managed';

interface WaitlistEntry {
  id: number;
  email: string;
  plan: Plan;
  businessName?: string;
  industry?: string;
  source?: string;
  joinedAt: string;
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidPlan(s: unknown): s is Plan {
  return s === 'gbp-auto' || s === 'local-seo' || s === 'ads-managed';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const plan = body.plan;
    const businessName =
      typeof body.businessName === 'string' ? body.businessName.trim() : '';
    const industry = typeof body.industry === 'string' ? body.industry.trim() : '';
    const source = typeof body.source === 'string' ? body.source.trim() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: 'Email 格式不正確' },
        { status: 400 },
      );
    }
    if (!isValidPlan(plan)) {
      return NextResponse.json(
        { ok: false, message: '請選擇要預約的方案' },
        { status: 400 },
      );
    }

    const entry: WaitlistEntry = {
      id: Date.now(),
      email,
      plan,
      businessName: businessName || undefined,
      industry: industry || undefined,
      source: source || undefined,
      joinedAt: new Date().toISOString(),
    };

    // Persist to Redis (best-effort, non-blocking in worst case)
    if (redis) {
      try {
        const list = (await redis.get<WaitlistEntry[]>(KEY)) ?? [];
        // Dedupe by email+plan
        if (!list.find((e) => e.email === email && e.plan === plan)) {
          list.push(entry);
          await redis.set(KEY, list);
        }
      } catch (err) {
        console.error('[waitlist] redis error', err);
      }
    }

    // Internal notification
    if (resend) {
      const planLabel =
        plan === 'gbp-auto'
          ? 'adlo GBP Auto NT$3,980/月'
          : plan === 'local-seo'
            ? 'adlo Local SEO Pack NT$9,800/月'
            : 'adlo Ads Managed NT$5,000 + 15%';

      try {
        await resend.emails.send({
          from: 'adlo 系統通知 <hello@adlo.tw>',
          to: ['adlo.hello.tw@gmail.com'],
          subject: `【訂閱 Waitlist】${email}｜${planLabel}`,
          text: [
            `新 Waitlist 登記 #${entry.id}`,
            '━━━━━━━━━━━━━━━━━',
            `Email：${email}`,
            `預約方案：${planLabel}`,
            businessName ? `店名：${businessName}` : null,
            industry ? `行業：${industry}` : null,
            source ? `來源：${source}` : null,
            `時間：${entry.joinedAt}`,
          ]
            .filter(Boolean)
            .join('\n'),
        });
      } catch (err) {
        console.error('[waitlist] email error', err);
      }
    }

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('[waitlist] error', err);
    return NextResponse.json(
      { ok: false, message: '系統暫時繁忙，請稍後再試' },
      { status: 500 },
    );
  }
}
