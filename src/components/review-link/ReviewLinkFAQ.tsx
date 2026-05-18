'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '為什麼要用 g.page 連結，不是 Google Maps URL？',
    a: 'g.page 連結（從 Google Business Profile 索取）會直接跳到「評論編寫畫面」——客人按了直接寫，省 4 步驟。Google Maps URL 只會打開地圖頁，客人還要自己找「撰寫評論」按鈕。g.page 連結的轉換率通常是 2-3 倍。',
  },
  {
    q: '客人掃 QR 之後一定要登入 Google 帳號嗎？',
    a: '對。Google 規定評論必須綁定真實帳號（防灌水）。但多數客人手機本來就登入 Google，所以體感是「掃了直接寫」。如果客人手機沒登入，會被導到登入畫面再回到評論編寫頁——多 1 步驟但仍可行。',
  },
  {
    q: 'QR Code 是用什麼生成的？版權沒問題嗎？',
    a: '本工具用 qrserver.com（Goqr Generator）公開免費 API 即時生成。生成的 PNG 完全屬於你，可印刷、可商用、無浮水印、不需註明來源。我們不存任何資料。',
  },
  {
    q: '收評論最有效的時機是什麼時候？',
    a: '研究顯示：服務結束 30 分鐘內，客人剛走出店門但還沒到下個行程，是最好時機。LINE 訊息趁這個時間傳，平均回覆率 25-40%。隔天才傳會掉到 10% 以下。',
  },
  {
    q: '可以要求客人寫 5 星嗎？',
    a: '不可以（違反 Google 政策，被檢舉會處罰整個商家）。但你可以：(1) 問「願意幫我們寫個誠實的評論嗎」(2) 強調「願意分享心得」(3) 不強迫、不附條件。一句話：請求評論可以，請求特定星數不行。',
  },
  {
    q: 'QR Code 印多大才能掃到？',
    a: '結帳台立卡建議 5x5 公分以上、桌邊小卡 3x3 公分、名片背面 2x2 公分（極限）。本工具下載的 600px PNG 印到 10x10 公分都很清楚。',
  },
  {
    q: '如果客人沒掃 QR 怎麼辦？',
    a: '用訊息模板取代——LINE / Email / 紙卡都行。本工具一次給你 6 套模板（3 通路 x 2 風格），複製貼上換情境用。',
  },
  {
    q: '可以分析這條評論連結是誰用的嗎？',
    a: '不行（也不該）。Google 的評論流程不會回傳 referer 給商家，所以無法追蹤「這條評論是從 QR / LINE / Email 來的」。如果你需要這類追蹤，建議升級 Local SEO Pack 訂閱方案，我們會用 UTM + Google Analytics 幫你做歸因。',
  },
];

export default function ReviewLinkFAQ() {
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
            const panelId = `review-link-faq-panel-${idx}`;
            const buttonId = `review-link-faq-button-${idx}`;
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
