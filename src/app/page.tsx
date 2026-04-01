import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/sections/Hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingDown, MapPin, MapPinOff, Search, PenLine, MousePointerClick, BarChart2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'adlo — 讓 Google 地圖把客戶送到你門口',
  description: '台灣在地 SEO 行銷專家。透過 Google 商家優化與區域精準廣告，為實體店面打造自動導流系統。',
  alternates: { canonical: 'https://adlo.tw' },
  openGraph: {
    title: 'adlo — 讓 Google 地圖把客戶送到你門口',
    description: '台灣在地 SEO 行銷專家。Google 商家優化、在地 SEO、精準廣告一站整合。',
    url: 'https://adlo.tw',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const serviceCards = [
  { icon: MapPin,           title: 'Google 商家優化', desc: '讓顧客搜尋「附近+行業」時，第一個看到你', href: '/services#gbp' },
  { icon: Search,           title: '在地 SEO 佈局',   desc: '針對「[地區]+[行業]」關鍵字做深度優化',     href: '/services#seo' },
  { icon: PenLine,          title: '內容行銷',         desc: '吸引搜尋流量的在地化文章與社群貼文',         href: '/services#content' },
  { icon: MousePointerClick,title: '精準廣告投放',     desc: 'Google Ads + Meta 廣告，只打方圓 5 公里的潛在客', href: '/services#ads' },
];

const painPoints = [
  { icon: TrendingDown, title: '廣告費越燒越貴',       desc: '花了大把廣告費，帶進的是點擊而不是實際客流，投資回報率不斷下滑。' },
  { icon: MapPinOff,    title: '競爭對手搶走排名',     desc: '客戶在附近搜尋，卻找到競爭對手。你的店面在 Google 地圖上被徹底隱形。' },
  { icon: BarChart2,    title: '不知道從哪裡開始',     desc: 'SEO、社群、廣告，每個人說的都不同，卻沒有一套整合方案為你量身設計。' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — 動畫版 */}
      <Hero />

      {/* Service Teasers */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-14">
            <div>
              <Badge className="mb-3 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
                核心服務
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
                我們做什麼？
              </h2>
              <div className="w-16 h-0.5 bg-[#1D9E75]" />
            </div>
            <Link href="/services" className="text-[#1D9E75] font-semibold text-sm hover:underline hidden md:block">
              查看完整服務方案 →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceCards.map(({ icon: Icon, title, desc, href }) => (
              <Link key={href} href={href} className="card-hover bg-white rounded-xl border border-slate-100 p-7 block group">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#1D9E75] transition-colors">
                  <Icon className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/services" className="text-[#1D9E75] font-semibold text-sm hover:underline">查看完整服務方案 →</Link>
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

      {/* Pain Points */}
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
            {painPoints.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="card-hover border-slate-100 group">
                <CardContent className="p-10">
                  <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors">
                    <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <Badge className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
            現在開始
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            準備好讓生意起飛了嗎？
          </h2>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
            填寫諮詢表單，我們在 24 小時內聯繫您，提供免費在地競爭環境評估報告。
          </p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-xl shadow-green-900/20 px-12">
            <Link href="/contact">立即免費諮詢 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
