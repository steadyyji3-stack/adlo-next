'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: '30 天試用期內取消，會被收錢嗎？',
    a: '不會。試用期內取消不產生任何費用。系統會在試用結束前寄信提醒你，不會無聲扣款。',
  },
  {
    q: '首年 6 折怎麼算？之後會漲嗎？',
    a: '年繳標準價 NT$29,800，首年 6 折為 NT$17,880，第二年起恢復 NT$29,800。這不是漲價，是首年優惠結束。續約前會提前通知，你可以決定續不續。',
  },
  {
    q: '月繳和年繳差在哪裡？',
    a: '功能完全一樣，差別只在價格與承諾期。月繳 NT$2,980/月（一年約 NT$35,760），年繳首年 NT$17,880 —— 省下約一半。想先試水溫就選月繳，確定要做一年就選年繳。',
  },
  {
    q: '需要把 Google 商家帳號交給你們嗎？',
    a: '不需要，而且我們不做這件事。adlo 不會取得你的 Google 授權、不會自動發布任何內容。所有動作都是你自己在自己的帳號上完成，我們只告訴你做什麼、怎麼做，並幫你記錄結果。',
  },
  {
    q: '每週真的只給一件事？不會太少嗎？',
    a: '這是刻意的。多數店家不是不知道該做什麼，是事情太多所以一件都沒做。一週做完一件、留下紀錄，一年就是 52 件。比起看完十頁清單然後放著，這樣有效得多。',
  },
  {
    q: '會保證排名或營收成長嗎？',
    a: '不會，任何人跟你保證都要小心。搜尋排名受 Google 演算法與市場競爭影響，這些我們控制不了。我們能保證的是：每週給你一個有依據的動作，並把前後變化如實記錄下來。',
  },
  {
    q: '會綁約嗎？可以隨時取消嗎？',
    a: '月繳不綁約，隨時可從會員中心自己取消。年繳為一年期，期間可取消續約、當期服務持續到期末。我們靠做出結果留你，不靠合約鎖你。',
  },
  {
    q: '我想先跟人聊聊再決定，可以嗎？',
    a: '可以。深度診斷開放免費預約，1 個工作天內回覆，適合先了解你的狀況再決定要不要訂閱。',
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
