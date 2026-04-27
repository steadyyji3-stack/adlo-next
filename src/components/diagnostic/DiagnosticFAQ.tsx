'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '為什麼現在是免費的？',
    a: 'adlo 還在產品早期。這一批預約我們不收診斷費，條件是：你看完報告後願意給我們 15 分鐘，說說哪裡有用、哪裡沒用。\n\n我們不靠一次性費用賺錢，靠的是你看完報告之後願意繼續合作。所以把第一份報告做到位，比收那筆診斷費重要得多。',
  },
  {
    q: '跟免費的廣告健檢有什麼差別？',
    a: 'Google 官方提供的「Recommendations」是自動產出的通用建議，目標是讓你加預算、擴大投放範圍。\n\n我們做的是人工 + 工具混合分析，對照你的行業、你的市場、你的競爭對手，給你一份針對你帳戶的具體清單。',
  },
  {
    q: '為什麼 3 個工作天就可以交付？',
    a: '我們使用半自動化分析流程，把帳戶數據提取和報告格式化的部分工具化了。人工部分專注在解讀、競品對比、和建議產出——這才是耗時的地方，也是自動化無法取代的部分。',
  },
  {
    q: '預約後多久會聯絡我？',
    a: '填寫聯絡表單後，1 個工作天內我們會回信確認。若你的行業或需求我們不熟，會直接告訴你——不會為了接單而勉強做。',
  },
  {
    q: '需要準備什麼資料？',
    a: '只需要 Google Ads 帳戶的「查看權限」和 Google 商家的「管理員」權限。我們不會更動你的任何設定，分析完也會立即移除存取權限。',
  },
  {
    q: '我不在台北，可以做診斷嗎？',
    a: '可以。診斷分析全遠端進行，我們需要的只是你的 Google Ads 帳戶查看權限，和你的 Google 商家管理員帳號。台灣任何縣市都可以。',
  },
  {
    q: '報告看不懂的話有人可以講解嗎？',
    a: '可以。報告交付後我們會附一個 Calendly 連結，你可以預約 30 分鐘線上說明會，把報告裡看不懂的地方逐一說明，並回答你的問題。',
  },
  {
    q: '拿了報告之後，一定要訂閱嗎？',
    a: '完全不必要。報告是獨立的產品，你拿到報告後可以自己改、交給你現有的廣告商改、或者什麼都不做。\n\n我們只希望你願意在看完報告後給我們 15 分鐘回饋，幫我們把產品做得更好。',
  },
];

export default function DiagnosticFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((item, idx) => {
        const isOpen = open === idx;
        const panelId = `diag-faq-panel-${idx}`;
        const buttonId = `diag-faq-trigger-${idx}`;
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
              <span className="text-base md:text-lg font-medium text-slate-900 flex items-start gap-3">
                <span className="text-emerald-600 text-sm md:text-base font-bold shrink-0 mt-0.5">
                  Q{idx + 1}
                </span>
                {item.q}
              </span>
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
              className="px-5 md:px-6 pb-5 pl-12 md:pl-14 text-slate-600 leading-relaxed whitespace-pre-line"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
