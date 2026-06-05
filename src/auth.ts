import NextAuth from 'next-auth';
import type { EmailConfig } from 'next-auth/providers/email';
import { Resend } from 'resend';
import { SupabaseRestAuthAdapter } from '@/lib/authjs-adapter';
import { getCustomerByEmail } from '@/lib/customers';

const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const CUSTOMER_SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;
const MAGIC_LINK_MAX_AGE_SECONDS = 60 * 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseRestAuthAdapter(),
  session: {
    strategy: 'database',
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    updateAge: CUSTOMER_SESSION_UPDATE_AGE_SECONDS,
  },
  pages: {
    signIn: '/customer/login',
    verifyRequest: '/customer/login/check-email',
    error: '/customer/login',
  },
  providers: [resendMagicLinkProvider()],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const customer = await getCustomerByEmail(user.email);
      return Boolean(customer);
    },
    async session({ session, user }) {
      if (session.user?.email) {
        const customer = await getCustomerByEmail(session.user.email);
        session.user.customerId = customer?.id ?? null;
        session.user.storeName = customer?.store_name ?? null;
        session.user.serviceStatus = customer?.service_status ?? null;
      }
      session.user.id = user.id;
      return session;
    },
  },
});

function resendMagicLinkProvider(): EmailConfig {
  return {
    id: 'resend',
    type: 'email',
    name: 'Email',
    from: 'adlo 系統通知 <hello@adlo.tw>',
    maxAge: MAGIC_LINK_MAX_AGE_SECONDS,
    sendVerificationRequest: async ({ identifier, url, expires }) => {
      const key = process.env.RESEND_API_KEY;
      if (!key) throw new Error('RESEND_API_KEY is required for customer magic links');

      await new Resend(key).emails.send({
        from: 'adlo 系統通知 <hello@adlo.tw>',
        to: identifier,
        subject: '登入 adlo 客戶後台',
        html: customerMagicLinkEmail(url, expires),
      });
    },
  };
}

function customerMagicLinkEmail(url: string, expires: Date) {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8" /><title>登入 adlo 客戶後台</title></head>
<body style="font-family:sans-serif;background:#f8fafc;margin:0;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0d2b20;padding:28px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;margin:0;">adlo</h1>
      <p style="color:#a7f3d0;margin:8px 0 0;">客戶後台登入連結</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#475569;line-height:1.7;">請點擊下方按鈕登入 adlo 客戶後台。這個連結為單次使用，並會在 ${expires.toLocaleString('zh-TW')} 到期。</p>
      <p style="margin:24px 0;"><a href="${url}" style="display:inline-block;background:#1D9E75;color:#fff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">登入客戶後台</a></p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;">如果你沒有要求登入，可以忽略這封信。</p>
    </div>
  </div>
</body>
</html>`;
}
