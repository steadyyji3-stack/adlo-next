import Link from 'next/link';
import { CalendarCheck, ArrowRight } from 'lucide-react';

/**
 * 工具頁共用「下一步」區塊｜黏著度 sprint
 * 兩個任務：① 推 /my-week（把單次使用者變每週回訪）② 相關工具互推（增加單次造訪的探索深度）。
 * 點擊透過 data-gtm-event 由 ClickTracker 自動上拋，location 帶當前工具 slug 供分析。
 */

interface RelatedTool {
  href: string;
  name: string;
  reason: string;
}

/** 每支工具的下一步推薦（依使用情境手排，不是隨機互連） */
const RELATED: Record<string, RelatedTool[]> = {
  'post-writer': [
    { href: '/tools/review-reply', name: '評論回覆產生器', reason: '貼文發了，評論也要回——回覆率是在地排名訊號' },
    { href: '/tools/line-broadcast', name: 'LINE 推播文案', reason: '同一批素材，順手排好 LINE 的一週推播' },
  ],
  'review-reply': [
    { href: '/tools/review-link', name: '評論收集連結', reason: '會回評論了，接著讓更多客人願意留評論' },
    { href: '/tools/post-writer', name: 'GBP 貼文產生器', reason: '評論處理完，檔案的活躍度靠每週貼文' },
  ],
  'review-link': [
    { href: '/tools/review-reply', name: '評論回覆產生器', reason: '評論開始進來後，一收一回才完整' },
    { href: '/check', name: 'GBP 健診', reason: '看看評論數在六維度裡拖了你多少分' },
  ],
  'map-visibility': [
    { href: '/tools/post-writer', name: 'GBP 貼文產生器', reason: '清單裡的「定期發文」，這支直接幫你做掉' },
    { href: '/check', name: 'GBP 健診', reason: '做完清單，回頭量一次分數變化' },
  ],
  competitor: [
    { href: '/tools/keyword', name: '關鍵字難度檢查', reason: '看完對手，查一下你們搶的字值多少' },
    { href: '/tools/ad-waste', name: '廣告浪費估算器', reason: '對手在投廣告？先確定你的錢沒有在漏' },
  ],
  keyword: [
    { href: '/tools/ad-waste', name: '廣告浪費估算器', reason: '知道單價了，算算現在的預算漏掉多少' },
    { href: '/tools/seo-scorer', name: 'SEO 文章計分', reason: '選好字，讓文章把它吃下來' },
  ],
  'seo-scorer': [
    { href: '/tools/keyword', name: '關鍵字難度檢查', reason: '文章分數 OK 之後，確認主打的字選對了' },
    { href: '/tools/prompt', name: 'AI 提示詞產生器', reason: '要改文章？先讓 AI 聽懂你要什麼' },
  ],
  name: [
    { href: '/check', name: 'GBP 健診', reason: '名字定了，商家檔案的基礎分數先量一次' },
    { href: '/tools/post-writer', name: 'GBP 貼文產生器', reason: '新店開張的前 7 天貼文，一次排好' },
  ],
  'line-broadcast': [
    { href: '/tools/post-writer', name: 'GBP 貼文產生器', reason: 'LINE 排好了，Google 商家那邊同步跟上' },
    { href: '/tools/review-link', name: '評論收集連結', reason: '推播裡放一條收評論連結，一魚兩吃' },
  ],
  prompt: [
    { href: '/tools/post-writer', name: 'GBP 貼文產生器', reason: '不想自己下提示詞？貼文我們直接生好' },
    { href: '/tools/name', name: '店名 / Slogan 產生器', reason: '用 AI 幫品牌想名字，也是一句話的事' },
  ],
  'ad-waste': [
    { href: '/tools/keyword', name: '關鍵字難度檢查', reason: '堵完漏洞，查查你買的字現在單價多少' },
    { href: '/check', name: 'GBP 健診', reason: '廣告止血後，免費流量的底子也體檢一下' },
  ],
  check: [
    { href: '/tools/map-visibility', name: '地圖優化清單', reason: '健診給分數，這支給你照做的待辦清單' },
    { href: '/tools/post-writer', name: 'GBP 貼文產生器', reason: '分數低多半因為太久沒發文——3 秒生 7 天' },
  ],
};

interface Props {
  /** 當前工具 slug（對應 RELATED key，也作為 GA 事件的 location） */
  current: string;
}

export default function ToolNextSteps({ current }: Props) {
  const related = RELATED[current] ?? RELATED['check'];

  return (
    <section className="bg-[#E1F5EE]/60 py-14 md:py-16">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* my-week 主推卡 */}
        <Link
          href="/my-week"
          data-gtm-event="my_week_save_click"
          data-gtm-location={current}
          className="group block rounded-2xl border border-[#1D9E75]/30 bg-white p-6 md:p-7 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E1F5EE] border border-[#1D9E75]/30">
              <CalendarCheck className="h-5.5 w-5.5 text-[#1D9E75]" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-1">
                別讓這次是最後一次——存一次店家檔案，每週素材自動備好
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                在「我的這週」存下店名＋產業，之後每週一打開，這週的 7 篇 GBP 貼文＋7 篇
                LINE 推播都幫你準備好。不用註冊，資料存在你的瀏覽器。
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] group-hover:text-[#0F6E56]">
                存好，下週一見 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </div>
        </Link>

        {/* 相關工具互推 */}
        <p className="mt-8 mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          做完這個，很多店家接著做
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {related.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              data-gtm-event="related_tool_click"
              data-gtm-location={current}
              className="group rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-[#1D9E75]/50"
            >
              <span className="flex items-center justify-between gap-2 text-sm font-bold text-slate-900">
                {t.name}
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-[#1D9E75]"
                  aria-hidden
                />
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">{t.reason}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
