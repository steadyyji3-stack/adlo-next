import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '付款成功 | adlo',
  description: '感謝你訂閱 adlo 在地行銷服務，我們將在 1–2 個工作天內主動聯繫你。',
  robots: { index: false },
};

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-24">
      <div className="max-w-lg w-full text-center">

        {/* 成功圖示 */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#E1F5EE] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#1D9E75]" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-3"
          style={{ fontFamily: 'var(--font-manrope)' }}>
          付款成功，歡迎加入！
        </h1>

        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          訂閱確認信已寄到你的信箱。<br />
          我們會在 <strong className="text-slate-700">1–2 個工作天內</strong>主動聯繫你，
          確認需求並開始在地 SEO 分析。
        </p>

        {/* 接下來步驟 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left mb-8 space-y-4">
          <p className="font-bold text-slate-800 mb-1">📋 接下來會發生什麼？</p>
          {[
            { step: '01', text: '確認信已寄出 — 請確認信箱（含垃圾郵件）' },
            { step: '02', text: '1–2 工作天內，我們寄送 Onboarding 問卷' },
            { step: '03', text: '安排 20 分鐘視訊說明會，確認目標與策略' },
            { step: '04', text: '第一個月優化計畫正式啟動' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[#E1F5EE] text-[#1D9E75] text-xs font-black flex items-center justify-center">
                {step}
              </span>
              <p className="text-slate-600 text-sm leading-relaxed pt-1">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="cta-gradient text-white hover:opacity-90">
            <Link href="/">回到首頁 <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:hello@adlo.tw">
              <Mail className="w-4 h-4 mr-1" /> 聯絡我們
            </a>
          </Button>
        </div>

      </div>
    </main>
  );
}
