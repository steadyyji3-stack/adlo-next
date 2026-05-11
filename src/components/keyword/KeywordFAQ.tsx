'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '這些數據從哪裡來？',
    a: '目前用 adlo 內部模型估算——基於關鍵字長尾度、商業意圖修飾詞（推薦/評價/便宜等）、產業 CPC 平均、台灣在地修飾（縣市/區）。供「方向性判斷」用，不能當精準投放預算。正式版會接 Google Ads Keyword Planner API。',
  },
  {
    q: '為什麼一次最多 10 組？',
    a: '10 組已經是「一次決策」需要的上限。超過 10 組通常是還沒想清楚要打什麼。先選 5-10 個你最想做的，分析完再決定下一輪要不要新增。',
  },
  {
    q: '建議「跑廣告試試」是什麼意思？',
    a: '指這個關鍵字 SEO 很難做（高難度）、但 CPC 相對不貴。建議用 NT$5,000/月小預算跑 2 週，看點擊到網站後的轉換率。如果轉換率好就加碼，差就移除。',
  },
  {
    q: '「強推 SEO」要花多久才看得到效果？',
    a: '低難度 + 中高搜尋量的字，搭配每月 2-3 篇相關 SEO 文章，台灣在地市場通常 3-6 個月能衝到 Google 搜尋第一頁。第一名通常落在 6-9 個月。',
  },
  {
    q: 'CPC 數字怎麼用？',
    a: '當作「廣告月預算的乘數」用。CPC NT$50 + 你要 100 個點擊 = 月預算 NT$5,000。轉換率假設 5%（中小店家平均）→ 5 個客戶。算清楚每個客戶可接受的取得成本，再決定要不要跑廣告。',
  },
  {
    q: '長尾關鍵字真的值得做嗎？',
    a: '對中小店家：值得，而且優先。「植牙」這種短頭字段是大醫院打的，你打不贏。「中山區 無痛植牙 推薦」這種長尾字，搜尋量只有 1/100，但意圖更強、競爭更少。打 10 個長尾字勝過搶 1 個頭字。',
  },
  {
    q: '如果我輸入的關鍵字回應「跳過」怎麼辦？',
    a: '通常是搜尋量太低（每月 < 100），代表這個字沒人在找。換個面向重寫——例如「我的招牌甜點」改成「台北 法式甜點 推薦」，加上地區跟產業大類就會出現流量。',
  },
  {
    q: '免費版有限制嗎？',
    a: '一次 10 組已經是 80% 場景的上限。如果你有更多關鍵字要分析，重複輸入即可（沒有日上限）。未來接真實 Google Ads API 後可能會有日次數限制。',
  },
];

export default function KeywordFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 text-center">
          常見問題
        </h2>
        <p className="text-sm md:text-base text-slate-600 text-center mb-10">
          試用前想先確認的事。
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = open === idx;
            const panelId = `keyword-faq-panel-${idx}`;
            const buttonId = `keyword-faq-button-${idx}`;
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
