'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '產出的貼文可以直接用嗎？',
    a: '是「初稿」不是「定稿」。我們的目標是讓你不再卡題，但每篇還是建議你瞄一眼、改成自己的口吻再發。畢竟客人最後是跟你買單，不是跟 AI。',
  },
  {
    q: '為什麼一次產 7 篇，不能單篇？',
    a: '因為「一週 7 天」是 GBP 演算法最在意的活躍訊號。Google 會看商家是否每天都有新內容。我們把 7 天的骨架給你，你只要每天挑時段發。',
  },
  {
    q: '七種主題分類為什麼是這幾個？',
    a: '節慶/教育/客戶見證/幕後/新品/促銷/QA — 這是我們做完台灣 200 家中小店家 GBP 後留下來的最有效組合。每種主題對應不同的演算法訊號和客人心理。',
  },
  {
    q: '會抓我的店家資料嗎？',
    a: '不會。你輸入的店名只用來客製化貼文文字，不存、不分析、不上 Google。產完關掉視窗就消失了。',
  },
  {
    q: '貼文會不會看起來很像 AI 寫的？',
    a: '我們花了大量時間調台灣口語跟 Ada 品牌語感，禁止簡中詞（賦能/打造/極致）和套話（歡迎大家來詢問）。但 AI 終究是 AI，你看一眼覺得哪裡卡，改一下就會差很多。',
  },
  {
    q: '產完還能換一篇嗎？',
    a: '目前每次會產 7 篇全新的。如果你想換某天的，重新產一次再挑你喜歡的那一篇。',
  },
  {
    q: '為什麼有的時段建議是 09:00 有的是 18:00？',
    a: '不同類型貼文有不同最佳發文時段。教育/QA 適合上班通勤時段（09:00 / 12:30），促銷/活動適合下班前後（17:00–18:30）。這些是我們從台灣店家 GBP 後台數據看出來的規律。',
  },
  {
    q: '免費版有限制嗎？',
    a: '一天可以產 3 次（一次 = 7 篇）。留 email 後加到 10 次/天。基本上夠你一個月用了。',
  },
];

export default function PostWriterFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 text-center">
          常見問題
        </h2>
        <p className="text-sm md:text-base text-slate-600 text-center mb-10">
          試用前想先確認的事，這邊先解答。
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full px-5 md:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-100/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm md:text-base font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div className="px-5 md:px-6 pb-4 text-sm md:text-[15px] text-slate-700 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
