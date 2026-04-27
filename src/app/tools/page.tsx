import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  PenLine,
  Radar,
  Search,
  FileCheck2,
  Link2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'adlo 免費行銷工具箱｜台灣店家每週回頭的工具站',
  description:
    '不用註冊、不抓個資。GBP 健診、貼文產生、競爭雷達、關鍵字難度——每週上一支新工具，把原本要收費的行銷諮詢，變成 3 秒自助產出。',
  alternates: { canonical: 'https://adlo.tw/tools' },
  openGraph: {
    title: 'adlo 免費行銷工具箱｜每週一支新工具',
    description:
      '把行銷諮詢變成 3 秒自助產出。給台灣中小店家每週會打開一次的工具站。',
    url: 'https://adlo.tw/tools',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

type ToolStatus = 'live' | 'soon';

interface Tool {
  slug: string;
  href: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ToolStatus;
  eta?: string;
  replaces: string;
}

const tools: Tool[] = [
  {
    slug: 'check',
    href: '/check',
    name: 'GBP 健診',
    tagline: '30 秒，看懂你家 Google 商家幾分',
    description:
      '貼上 Google 地圖連結，自動計算六維度分數：評論、照片、回覆、關鍵字、完整度、在地性。找出最弱的那一項。',
    icon: Activity,
    status: 'live',
    replaces: '基礎版月訂閱的入門諮詢',
  },
  {
    slug: 'post-writer',
    href: '/tools/post-writer',
    name: 'GBP 貼文產生器',
    tagline: '輸入店名，直接給你下週 7 天的貼文',
    description:
      '告訴我你賣什麼、客人是誰，AI 幫你寫一週 7 篇 Google 商家貼文。含節慶、促銷、QA、幕後四種風格，直接複製貼上。',
    icon: PenLine,
    status: 'live',
    replaces: '基礎版 NT$8,800 裡的「月 4 篇貼文」',
  },
  {
    slug: 'competitor',
    href: '/tools/competitor',
    name: '競爭對手雷達',
    tagline: '你 vs 同區 3 家店，雷達圖一眼看清',
    description:
      '輸入你的店名 + 一個關鍵字，adlo 幫你抓 Google 地圖前 3 名競爭對手，產出六維度雷達比較圖。',
    icon: Radar,
    status: 'soon',
    eta: 'Week 3',
    replaces: '數位市調 NT$15,000 的快速版',
  },
  {
    slug: 'keyword',
    href: '/tools/keyword',
    name: '關鍵字難度檢查',
    tagline: '台灣在地關鍵字 × 搜尋量 × 難度 × 廣告單價',
    description:
      '輸入一組台灣關鍵字，一次看到每個月有多少人搜、SEO 多難做、跑廣告一次點擊多少錢。決策用。',
    icon: Search,
    status: 'soon',
    eta: 'Week 4',
    replaces: 'Growth 方案「10 關鍵字佈局」研究',
  },
  {
    slug: 'seo-scorer',
    href: '/tools/seo-scorer',
    name: 'SEO 文章計分',
    tagline: '貼 URL，即時拿到分數 + 3 點修改建議',
    description:
      '貼你的部落格文章網址，adlo 抓 H1、字數、關鍵字密度、圖 alt、meta、連結結構，算出 SEO 分數和最該先改的 3 件事。',
    icon: FileCheck2,
    status: 'soon',
    eta: 'Week 5',
    replaces: 'Pro 方案「無限 SEO 文章」的審稿流程',
  },
  {
    slug: 'review-link',
    href: '/tools/review-link',
    name: '評論收集連結',
    tagline: '一條短連結 + 一套收評論模板',
    description:
      '填基本資料，幫你產出專屬 Google 評論短連結、QRCode，再加一套讓客人願意寫的訊息模板（LINE / 卡片 / email 三版本）。',
    icon: Link2,
    status: 'soon',
    eta: 'Week 6',
    replaces: '月訂閱「評論管理策略建議」',
  },
  {
    slug: 'name',
    href: '/tools/name',
    name: '店名 / Slogan 產生器',
    tagline: '新品牌命名、老店改 slogan 都能用',
    description:
      '輸入產業、風格、客群，AI 一次給你 30 組店名 + 20 組 slogan，每組附上「為什麼這個名字能被記住」的解釋。',
    icon: Sparkles,
    status: 'soon',
    eta: 'Week 7',
    replaces: '品牌諮詢 NT$6,000 的快速版',
  },
];

export default function ToolsIndexPage() {
  const liveCount = tools.filter((t) => t.status === 'live').length;
  const soonCount = tools.filter((t) => t.status === 'soon').length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-5">
              免費 · 不用註冊 · 每週一支新工具
            </Badge>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.15]"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              把行銷諮詢變成{' '}
              <span className="text-[#1D9E75]">3 秒自助產出</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              以前要收 NT$15,000 的市調、NT$6,000 的品牌諮詢，
              <br className="hidden sm:block" />
              現在貼一個連結 3 秒拿答案。為台灣中小店家做的工具箱。
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500 mt-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {liveCount} 支已上線
              </span>
              <span className="text-slate-300">|</span>
              <span>{soonCount} 支開發中</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isLive = tool.status === 'live';
              const cardClass = `group relative bg-white border rounded-2xl p-6 flex flex-col transition-all ${
                isLive
                  ? 'border-[#1D9E75]/30 hover:border-[#1D9E75] hover:shadow-lg cursor-pointer'
                  : 'border-slate-200 opacity-80'
              }`;

              const cardBody = (
                <>
                  {/* Status badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isLive
                          ? 'bg-[#E1F5EE] text-[#1D9E75]'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {isLive ? (
                      <Badge className="bg-[#1D9E75] text-white border-0 text-[10px] font-extrabold tracking-wide">
                        FREE 上線中
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-0 text-[10px] font-extrabold tracking-wide">
                        {tool.eta} 上線
                      </Badge>
                    )}
                  </div>

                  <h3
                    className="text-lg font-extrabold text-slate-900 mb-1.5"
                    style={{ fontFamily: 'var(--font-manrope)' }}
                  >
                    {tool.name}
                  </h3>
                  <p className="text-sm text-[#0F6E56] font-semibold mb-3">
                    {tool.tagline}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
                    {tool.description}
                  </p>

                  {isLive && (
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end text-xs">
                      <span className="text-[#1D9E75] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        立即使用 <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </>
              );

              return isLive ? (
                <Link
                  key={tool.slug}
                  href={tool.href}
                  className={cardClass}
                  data-gtm-event={`tool_card_click_${tool.slug}`}
                >
                  {cardBody}
                </Link>
              ) : (
                <div key={tool.slug} className={cardClass}>
                  {cardBody}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Free */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            為什麼這些工具全部免費？
          </h2>
          <div className="text-slate-600 leading-relaxed space-y-3 text-left sm:text-center">
            <p>
              因為我們相信：
              <span className="font-bold text-slate-900">
                用過才知道適不適合你
              </span>
              。
            </p>
            <p>
              你先用三個月免費工具知道自己分數停在 65 分——
              <br className="hidden sm:block" />
              之後要不要付月訂閱讓我們幫你打到 85 分，那是三個月後的事。
            </p>
            <p className="text-sm text-slate-500 pt-3">
              工具會持續新增，訂閱 waitlist 可提前預約開台優惠 →{' '}
              <Link
                href="/subscribe"
                className="text-[#1D9E75] font-bold underline underline-offset-4 hover:opacity-80"
                data-gtm-event="tools_page_subscribe_link"
              >
                看月訂閱方案
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Deeper CTA */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3
            className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3"
            style={{ fontFamily: 'var(--font-manrope)' }}
          >
            工具分數出來後，想要專人看一遍？
          </h3>
          <p className="text-slate-600 mb-6">
            /diagnostic 深度診斷現期開放免費預約，1 個工作天內回覆。
          </p>
          <Link
            href="/diagnostic"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            data-gtm-event="tools_page_diagnostic_cta"
          >
            預約免費深度診斷 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
