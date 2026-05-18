'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '這個工具的分數可信嗎？',
    a: '可信，因為它<strong>真的去抓你的網頁 HTML 即時計算</strong>，不是用 AI 猜。10 個維度（title、meta、H1、H2 結構、字數、圖片 alt、內外連結、canonical、JSON-LD schema）都從你的 HTML 直接 parse 出來，可以自己 view source 驗證。',
  },
  {
    q: '為什麼是這 10 個維度？',
    a: '這 10 項是 Google 演算法跟 SEO 從業者公認最關鍵、且<strong>店家可自己改</strong>的訊號。其他指標（站外連結權重、Core Web Vitals、HTTPS、mobile-friendly）也重要，但要嘛工具測不到（站外）、要嘛跟你的 hosting / CMS 綁定（速度），所以本工具聚焦在「文章層面可自改」的部分。',
  },
  {
    q: '為什麼分數沒有想像中高？',
    a: '一般 CMS（Wordpress、Wix、Medium）預設不會幫你補 canonical、JSON-LD schema 這些。多數中小店家文章拿 55-70 分是正常的——這份報告的價值就在告訴你「下一步補哪 3 個」就能跳到 80+。',
  },
  {
    q: 'SEO 文章字數真的越多越好嗎？',
    a: '不是越多越好，是要「夠深」。中文 800 字以上是 Google 認為內容有深度的起跳線，1500+ 字的長文通常排名更穩。但水字數沒用，要是真的有資訊密度。',
  },
  {
    q: '為什麼 canonical 沒設定我就扣分？',
    a: '因為 Google 會把不同 URL 的相同內容當作重複內容（duplicate content），扣全站權重。最常見的問題是「同一篇文章用 ?utm=xxx 參數產生不同 URL」——加 canonical 告訴 Google「正規版本是哪個」，是 1 分鐘可改的高 ROI 修正。',
  },
  {
    q: '工具會儲存我輸入的 URL 嗎？',
    a: '不會。每次分析都是即時 fetch + 計算，URL 跟結果不存資料庫、不存 log（只記 IP 速率計數）。30 秒後關掉視窗就消失。',
  },
  {
    q: '可以分析別人的網站嗎？',
    a: '可以。本工具只 fetch 公開 HTML，跟你用瀏覽器打開那個 URL 看到的一樣。可以拿來分析競爭對手文章，看他們做對什麼。',
  },
  {
    q: '免費版有什麼限制？',
    a: '一天 3 次，留 email 後 10 次。每次 fetch 最多 2MB 文件、12 秒 timeout。不能分析需要登入的頁面（會抓不到內容）。',
  },
];

export default function SeoScorerFAQ() {
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
            const panelId = `seo-scorer-faq-panel-${idx}`;
            const buttonId = `seo-scorer-faq-button-${idx}`;
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
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
