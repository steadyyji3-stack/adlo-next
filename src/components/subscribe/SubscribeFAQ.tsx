'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Waitlist 登記後要付款嗎？',
    a: '完全不用。現在只是預留名額，開台前一週我們會寄信通知，你可以決定要不要正式啟動。',
  },
  {
    q: '為什麼是 60 天後才開台？',
    a: 'adlo 正在完成公司登記與金流整合（綠界台幣月訂閱），我們希望第一天開台就讓你用得順。這 60 天你可以先用免費工具熟悉我們。',
  },
  {
    q: '首月 6 折優惠是真的嗎？',
    a: '真的。Waitlist 名單限量鎖定首月 6 折，第二個月起恢復原價、且保證至少 12 個月不調漲。這是給早期支持者的感謝。',
  },
  {
    q: '三個方案可以混搭嗎？',
    a: '可以。Local SEO Pack 與 Ads Managed 最常一起訂（SEO 長期 + 廣告短期）。混搭總額享加購 9 折。',
  },
  {
    q: '會綁約嗎？可以隨時取消嗎？',
    a: '不綁約。每月自動續訂，隨時可從會員中心取消。我們靠做出結果留你，不靠合約鎖你。',
  },
  {
    q: '我還是想先跟人聊聊，可以嗎？',
    a: '可以。/diagnostic 深度診斷現期開放免費預約，1 個工作天內回覆，適合先了解你的狀況再決定方案。',
  },
];

export default function SubscribeFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            還在猶豫？這裡先回答你
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                aria-expanded={open === i}
              >
                <span className="font-bold text-slate-900 pr-4">{f.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
