'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '為什麼不顯示具體月搜尋量跟 CPC 數字？',
    a: '因為那些只有 Google 自己最準。我們只用啟發式邏輯（產業、商業意圖修飾、字長、在地修飾）告訴你「相對級距」跟「該不該打」。要看精準月搜尋量、CPC、競爭程度，請用 Google Ads Keyword Planner（結果頁每組都附直連）——免費，需 Google 帳號。',
  },
  {
    q: '那 SEO 難度的「43/100」這個數字呢？',
    a: '這是 adlo 的相對評分，不是查 Google。判斷依據在每組分析下方都會列出（含哪個商業意圖修飾、產業競爭程度、有沒有在地修飾降低範圍）。這是「策略 signal」不是「精準分數」——同個字在 Ahrefs 跟 Semrush 也會給出不同分數，本來就是估算。',
  },
  {
    q: '什麼時候會接真實 Google Ads API？',
    a: 'Google Ads Keyword Planner API 是免費的，但需要 active Google Ads 帳號 + developer token 申請。我們在開發中，預計 1-2 個月內把這個工具升級為「真實數據版」。在那之前，請把這當策略框架用。',
  },
  {
    q: '為什麼一次最多 10 組？',
    a: '10 組已經是「一次決策」需要的上限。超過 10 組通常是還沒想清楚要打什麼。先選 5-10 個你最想做的，分析完再決定下一輪要不要新增。',
  },
  {
    q: '為什麼有「品牌詞」「資訊型」「在地服務」這些分類？',
    a: '不同類型該用不同策略：(1) 品牌詞 → 守住前 3 名就好，不用跑廣告搶自己；(2) 資訊型（「植牙怎麼選」「咖啡是什麼」）→ 寫深度 blog 文章；(3) 在地服務（「中山區 剪髮」）→ GBP + 在地內容雙管齊下；(4) 商業型（「植牙 推薦」）→ 看難度跟 CPC 決定 SEO 或廣告。一律當「商業型」處理會浪費預算。',
  },
  {
    q: '建議「跑廣告試試」是什麼意思？',
    a: '指這個關鍵字 SEO 很難做（高難度）、但 CPC 相對不貴。建議用 NT$5,000/月小預算跑 2 週，看點擊到網站後的轉換率。如果轉換率好就加碼，差就移除。',
  },
  {
    q: '什麼是「在地獨占機會」？',
    a: '當你的字是「地區詞 + 服務詞」組合（例：「板橋 美髮」「大安 早午餐」），這是中小店家最該攻的甜蜜點——競爭對手少、客戶意圖明確、GBP + 在地內容就能稱霸。比追主流字（「美髮」「早午餐」）ROI 高 5 倍。',
  },
  {
    q: '結果頁的「同義詞 / 長尾建議」要怎麼用？',
    a: '看完一個字的分析後，這些是「你可能也想分析」的延伸字。複製你想要的，下一輪輸入再跑一次。長尾通常難度更低、轉換率更高——把這些字依序鋪上 blog 是中小店家最便宜的 SEO 路徑。',
  },
  {
    q: '「強推 SEO」要花多久才看得到效果？',
    a: '低難度 + 中高搜尋量的字，搭配每月 2-3 篇相關 SEO 文章，台灣在地市場通常 3-6 個月能衝到 Google 搜尋第一頁。第一名通常落在 6-9 個月。',
  },
  {
    q: 'CPC 等級怎麼用？',
    a: '低 = 通常 NT$10 以下、中 = NT$10-50、高 = NT$50+。當作「決定要不要跑廣告」的快速判斷：高 CPC 表示業者願意花大錢搶這個字，通常因為 1 個客戶利潤夠高。中小店家進場前先去 Google Ads Keyword Planner 查精準數字，算清楚單客成本能不能接受。',
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
