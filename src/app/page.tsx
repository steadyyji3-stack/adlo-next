import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/sections/Hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity, Bell, PenLine, MessageSquare, Radar, Search, FileCheck2, Link2, Sparkles,
  TrendingDown, MapPinOff, BarChart2, ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'adlo — 讓 Google 地圖把客戶送到你門口',
  description: '台灣中小店家的在地行銷工具箱。8 支免費工具：GBP 健診、貼文產生、評論收集、競爭雷達——3 秒自助產出，不用註冊、不交出 Google 帳號。',
  alternates: { canonical: 'https://adlo.tw' },
  openGraph: {
    title: 'adlo — 讓 Google 地圖把客戶送到你門口',
    description: '台灣中小店家的在地行銷工具箱。8 支免費工具，結構化自助產出，不是 AI 聊天。',
    url: 'https://adlo.tw',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const tools = [
  { icon: Activity,       name: 'GBP 健診',          tagline: '30 秒看 Google 商家幾分', href: '/check' },
  { icon: PenLine,        name: 'GBP 貼文產生器',     tagline: '下週 7 天貼文，3 秒搞定',   href: '/tools/post-writer' },
  { icon: MessageSquare,  name: 'LINE 推播產生器',    tagline: '7 篇 LINE OA 推播初稿',     href: '/tools/line-broadcast' },
  { icon: Radar,          name: '競爭對手雷達',       tagline: '你 vs 同區 3 家，一張圖',   href: '/tools/competitor' },
  { icon: Search,         name: '關鍵字難度檢查',     tagline: '這個字值不值得做',         href: '/tools/keyword' },
  { icon: FileCheck2,     name: 'SEO 文章計分',       tagline: '貼 URL，即時拿分數',       href: '/tools/seo-scorer' },
  { icon: Link2,          name: '評論收集連結',       tagline: 'QR + 6 套訊息模板',        href: '/tools/review-link' },
  { icon: Sparkles,       name: '店名 / Slogan',     tagline: '一次給 15 組命名',         href: '/tools/name' },
];

const painPoints = [
  {
    icon: TrendingDown,
    title: '廣告費越燒越貴',
    desc: '帶進的是點擊不是客流。先把免費的 Google 商家做起來，比一直買廣告划算。',
    cta: '先做 GBP 健診',
    href: '/check',
  },
  {
    icon: MapPinOff,
    title: '競爭對手搶走排名',
    desc: '客人在附近搜尋卻找到別家。看一眼同區前 3 強在哪、你差在哪。',
    cta: '開競爭對手雷達',
    href: '/tools/competitor',
  },
  {
    icon: BarChart2,
    title: '不知道從哪裡開始',
    desc: '每個人說的都不同。8 支工具按順序跑一輪，30 秒知道第一步該補什麼。',
    cta: '逛免費工具箱',
    href: '/tools',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — 互動版 */}
      <Hero />

      {/* 免費工具箱 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
                免費工具箱
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
                把要收費的行銷諮詢，<br className="md:hidden" />變成 3 秒自助產出
              </h2>
              <p className="text-slate-500 max-w-lg leading-relaxed">
                不用註冊、不交出 Google 帳號。結構化工具，不是 AI 聊天——複製就能用。
              </p>
              <div className="w-16 h-0.5 bg-[#1D9E75] mt-5" />
            </div>
            <Link href="/tools" className="text-[#1D9E75] font-semibold text-sm hover:underline hidden md:inline-flex items-center gap-1">
              看完整工具箱 <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          {/* 精選：我的這週 */}
          <Link
            href="/my-week"
            aria-label="我的這週：存一次店家檔案，每週素材自動備好"
            className="group block rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 ring-1 ring-emerald-200 p-6 sm:p-8 mb-6 hover:ring-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="size-12 rounded-xl bg-[#1D9E75] flex items-center justify-center shrink-0">
                <Bell className="size-6 text-white" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-[11px] font-bold mb-2">存一次，每週自動備好</Badge>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
                  我的這週：每週 14 篇 GBP + LINE 素材，不用重填
                </h3>
                <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                  設定一次店名 + 產業 + 標籤，之後每次進來素材都備好。檔案只存你的瀏覽器，不上傳。
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F6E56] shrink-0 group-hover:gap-2.5 transition-all">
                開始設定 <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </div>
          </Link>

          {/* 8 工具 grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map(({ icon: Icon, name, tagline, href }) => (
              <Link key={href} href={href} className="card-hover bg-white rounded-xl border border-slate-100 p-5 block group">
                <div className="w-11 h-11 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#1D9E75] transition-colors">
                  <Icon className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" aria-hidden />
                </div>
                <h3 className="text-slate-800 font-bold text-base mb-1">{name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{tagline}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/tools" className="text-[#1D9E75] font-semibold text-sm hover:underline">看完整工具箱 →</Link>
          </div>
        </div>
      </section>

      {/* Trends Teaser */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-12 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="inline-block text-xs font-bold tracking-widest text-[#0F6E56] uppercase mb-4">
                MARKET INTELLIGENCE
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
                台灣在地搜尋趨勢
              </h2>
              <p className="text-slate-600 leading-relaxed max-w-lg">
                即時追蹤「附近餐廳」、「到府服務」等關鍵字熱度，找到你的行銷切入點。數據由 Google Trends 提供。
              </p>
            </div>
            <Button asChild className="flex-shrink-0 cta-gradient text-white hover:opacity-90 shadow-lg font-bold" size="lg">
              <Link href="/trends">查看趨勢儀表板 →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Points — 痛點導向工具 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
              你的痛點
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              你正在面對這些問題嗎？
            </h2>
            <div className="w-16 h-0.5 bg-[#1D9E75] mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map(({ icon: Icon, title, desc, cta, href }) => (
              <Link key={title} href={href} className="block group">
                <Card className="card-hover border-slate-100 h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors">
                      <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" aria-hidden />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm flex-1">{desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F6E56] group-hover:gap-2.5 transition-all">
                      {cta} <ArrowRight className="w-4 h-4" aria-hidden />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — 產品導向 */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <Badge className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
            現在開始
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            3 秒，先讓工具幫你做一件事
          </h2>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
            不用註冊、不用信用卡。先試一支工具，覺得有用再把店家檔案存起來，每週素材自動備好。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-xl shadow-green-900/20 px-10">
              <Link href="/tools">探索 8 支免費工具 →</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold border-slate-200 hover:border-[#1D9E75] hover:text-[#1D9E75]">
              <Link href="/my-week">我的這週素材</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-slate-400">
            想要我們直接幫你做？
            <Link href="/diagnostic" className="text-emerald-700 font-medium hover:underline ml-1">看代管診斷方案 →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
