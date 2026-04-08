import type { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '付款取消 | adlo',
  description: '付款流程已取消，你可以隨時回到定價頁面重新訂閱。',
  robots: { index: false },
};

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-24">
      <div className="max-w-lg w-full text-center">

        {/* 圖示 */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-slate-400" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-3"
          style={{ fontFamily: 'var(--font-manrope)' }}>
          付款已取消
        </h1>

        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          沒關係，你可以隨時回到定價頁面重新選擇方案。<br />
          如果你有任何疑問，歡迎直接聯絡我們。
        </p>

        {/* 常見疑慮 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left mb-8 space-y-4">
          <p className="font-bold text-slate-800 mb-1">💬 有疑慮？我們來解答</p>
          {[
            { q: '不確定哪個方案適合我', a: '填寫聯絡表單，20 分鐘免費評估，不需要先付款' },
            { q: '想先了解服務內容', a: '查看我們的服務方案頁或城市落地頁，有詳細說明' },
            { q: '想要客製化方案', a: '直接聯絡我們，我們可以依需求調整內容' },
          ].map(({ q, a }) => (
            <div key={q} className="border-l-2 border-[#1D9E75] pl-4">
              <p className="font-semibold text-slate-700 text-sm">{q}</p>
              <p className="text-slate-500 text-sm mt-0.5">{a}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="cta-gradient text-white hover:opacity-90">
            <Link href="/pricing">
              <ArrowLeft className="w-4 h-4 mr-1" /> 回到定價方案
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              <MessageCircle className="w-4 h-4 mr-1" /> 免費諮詢
            </Link>
          </Button>
        </div>

      </div>
    </main>
  );
}
