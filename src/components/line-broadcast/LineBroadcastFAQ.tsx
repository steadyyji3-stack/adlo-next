'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '產出的文案可以直接複製到 LINE OA 推播嗎？',
    a: '可以。每篇都已經符合 LINE OA 一則文字訊息的字數上限（500 字），複製貼到「群發訊息」或「自動回應」都能用。如果要分多則發，建議從中間自然斷行的地方拆。',
  },
  {
    q: '為什麼不直接 7 篇全推？',
    a: 'LINE OA 推播多 = 封鎖率高 = 觸及降低，是循環陷阱。LINE 官方建議每週 2-3 則。我們給你 7 篇是為了讓你「挑」最適合本週的，不是要你全推。從教育 + 幕後 + 1 篇促銷的組合開始。',
  },
  {
    q: '產業選錯會有差嗎？',
    a: '會。產業會影響文案的語感詞（例如「揉麵糰」vs「療程設計」）。選錯也能用，只是要自己手動改。挑最接近的選就好，不一定要 100% 對應。',
  },
  {
    q: 'AI 寫的會被客人看出來嗎？',
    a: '這個工具不是 AI 生成，是「結構化模板」——同一組店名/產業會產出同一組文案。我們刻意避開「親愛的好朋友」這類 LINE 一秒就被看穿的罐頭句。但建議產出後自己再加 1-2 句「只有你才寫得出來」的細節（例如店裡發生的事），會更像真人。',
  },
  {
    q: '推播時段為什麼是早 8-9 / 中午 12-13 / 晚 20:30-22:00？',
    a: '依台灣 LINE 流量數據——通勤時段、午餐時段、睡前。這三個時段點開率最高、停留時間最長。早上 6 點前或下午 2-4 點推 = 沒人在看 = 演算法判定低互動 = 之後觸及更差。',
  },
  {
    q: '免費方案 200 則夠用嗎？',
    a: '依 2026 LINE OA 台灣方案：免費（輕用量）含 200 則/月，超過即停推。好友 50 以下、每週 1 則以下勉強夠用。好友破 100 後就要評估升中用量（NT$1,600/月、25,000 則）。LINE 已取消過去的輕用量付費方案，目前只剩免費 → 中用量 → 高用量三階。',
  },
  {
    q: '我有 LINE OA 但好友數很少，先衝好友還是先發推播？',
    a: '先衝好友。50 人以下推播 ROI 很低（互動樣本太小）。建議：(1) 結帳台立 QR 加 LINE 招牌 (2) Google 評論回覆裡放加 LINE 連結 (3) IG / Threads 個人檔案放 LINE ID。到 100 好友再開始排推播節奏。',
  },
  {
    q: '可以追蹤客人從哪則推播下單嗎？',
    a: 'LINE OA 後台會給你「點擊率」「閱讀率」，但無法直接歸因到訂單。如果想追訂單來源，需要在 LINE 推播裡放帶 UTM 的連結，再對接 Google Analytics。需要這層歸因可以升級 Local SEO Pack 訂閱方案，我們會幫你串。',
  },
];

export default function LineBroadcastFAQ() {
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
            const panelId = `line-broadcast-faq-panel-${idx}`;
            const buttonId = `line-broadcast-faq-button-${idx}`;
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
