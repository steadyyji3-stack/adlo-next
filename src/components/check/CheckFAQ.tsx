'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '查分數會收到 adlo 的業配電話嗎？',
    a: '不會。我們連電話欄位都沒有。你留 email 只會收到健檢優化建議，想退訂就退。',
  },
  {
    q: '我的店資料會被存嗎？',
    a: '只存你查詢的 URL 和分數結果，24 小時後自動刪。不抓客人名單、不抓聯絡人。',
  },
  {
    q: '分數怎麼算的？',
    a: '6 項公開指標加權：商家完整度 20% / 評論數 20% / 回覆率 15% / 照片 15% / 關鍵字 15% / 在地競爭 15%。都是 Google 公開的資料。',
  },
  {
    q: '為什麼第 4 次要 email？',
    a: '一台電腦查 3 次通常夠，再下去多半是幫別人查。留 email 是為了確保你是真的在乎這件事，不是爬蟲。',
  },
  {
    q: '分數低是不是代表店很爛？',
    a: '不是。低分只代表「Google 呈現給客人的樣子沒補齊」，跟實際服務品質無關。我們就是幫你把這一塊補起來。',
  },
  {
    q: '免費查完還要付錢嗎？',
    a: '查分數永遠免費。如果你想知道「為什麼是這分數、怎麼修」，才需要 NT$1,990 的完整報告。',
  },
];

export default function CheckFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-24 px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-2">常見問題</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">在你按下查詢之前</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = open === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-trigger-${idx}`;
            return (
              <div key={idx} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-5 text-left hover:bg-slate-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
                >
                  <span className="text-base md:text-lg font-medium text-slate-900">{item.q}</span>
                  <ChevronDown
                    className={`size-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
                    aria-hidden
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-5 md:px-6 pb-5 text-slate-600 leading-relaxed"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
