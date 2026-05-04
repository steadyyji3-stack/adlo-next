'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '對手是怎麼挑出來的？',
    a: '輸入「關鍵字 + 城市」後，我們從 Google 地圖前 3 名（同產業、同區）抓出來。預設取「最有威脅的 3 家」——通常是同價位帶、同類型客群的店。',
  },
  {
    q: '六維度跟 GBP 健診一樣嗎？',
    a: '一樣。完整度 / 評論 / 回覆率 / 照片 / 關鍵字 / 在地排名——這 6 項是 Google 演算法在地排名最在意的訊號，所有對手都用同一把尺量，比較才有意義。',
  },
  {
    q: '雷達圖怎麼看？',
    a: '面積愈大代表整體愈強。重點看「形狀」——對手哪邊凸出（強項），你哪邊凹進去（弱項）。凹進去那一塊就是你最該補的破口。',
  },
  {
    q: '如果分數比對手低，是不是輸了？',
    a: '不是。在地客群常常不是只看 Google 分數選店。但分數差太多（超過 15 分）會在「客人決定要不要進門前」就被滑掉——這是這個工具想幫你抓的。',
  },
  {
    q: '可以自選對手嗎？',
    a: '目前只能自動抓。我們的邏輯是「跟你最像的 3 家」，因為這通常比你心裡想的對手更會搶你客人。後續會加「自選」模式。',
  },
  {
    q: '會抓我的店資料嗎？',
    a: '不會。輸入的店名、關鍵字、城市只用來生成這次比較，不存、不上 Google、不外流。關掉視窗就消失。',
  },
  {
    q: '免費版有限制嗎？',
    a: '一天可以查 3 次（一次 = 你 + 3 家對手）。留 email 加到 10 次/天。再多基本上不需要——同一家店一週看一次就夠了。',
  },
  {
    q: '比完想要更深的攻防策略呢？',
    a: '這個工具給你看「誰強誰弱」。如果你想看「該怎麼打」，預約 30 分鐘免費深度診斷，我們會直接看你的 GBP + 3 家對手，給你客製攻防順序。',
  },
];

export default function CompetitorFAQ() {
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
            const panelId = `competitor-faq-panel-${idx}`;
            const buttonId = `competitor-faq-button-${idx}`;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden"
              >
                <button
                  type="button"
                  id={buttonId}
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full px-5 md:px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-100/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
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
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-5 md:px-6 pb-4 text-sm md:text-[15px] text-slate-700 leading-relaxed"
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
