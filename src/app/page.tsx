import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp, TrendingDown, MapPin, MapPinOff,
  Search, PenLine, MousePointerClick, BarChart2
} from 'lucide-react';

const serviceCards = [
  { icon: MapPin, title: 'Google 商家優化', desc: '讓你的店家出現在地圖三包廂，關鍵字首位曝光', href: '/services#gbp' },
  { icon: Search, title: '在地 SEO 佈局', desc: '針對「[地區]+[行業]」關鍵字做深度優化', href: '/services#seo' },
  { icon: PenLine, title: '內容行銷', desc: '吸引搜尋流量的在地化文章與社群貼文', href: '/services#content' },
  { icon: MousePointerClick, title: '精準廣告投放', desc: 'Google Ads + Meta 廣告，只打方圓 5 公里的潛在客', href: '/services#ads' },
];

const painPoints = [
  { icon: TrendingDown, title: '廣告費越燒越貴', desc: '花了大把廣告費，帶進的是點擊而不是實際客流，投資回報率不斷下滑。' },
  { icon: MapPinOff, title: '競爭對手搶走排名', desc: '客戶在附近搜尋，卻找到競爭對手。你的店面在 Google 地圖上被徹底隱形。' },
  { icon: BarChart2, title: '不知道從哪裡開始', desc: 'SEO、社群、廣告，每個人說的都不同，卻沒有一套整合方案為你量身設計。' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(146,64,14,0.05),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <Badge className="mb-6 text-[#92400e] border-amber-200 bg-amber-50 tracking-widest text-xs font-bold uppercase" variant="outline">
              台灣在地 SEO 行銷專家
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-6 tracking-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              讓 Google 地圖<br />
              <span className="text-[#92400e]">把客戶送到你門口</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
              adlo 專攻區域精準行銷。從 Google 商家優化到在地 SEO，我們只服務認真想衝業績的老闆。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="cta-gradient text-white hover:opacity-90 shadow-lg shadow-amber-900/20 font-bold">
                <Link href="/contact">免費諮詢，限量 5 名 →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link href="/services">了解服務方案</Link>
              </Button>
            </div>
          </div>

          {/* Stats card */}
          <div className="hidden md:block">
            <Card className="shadow-xl border-slate-100">
              <CardContent className="p-10">
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-8">實績數據</p>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                      92<span className="text-[#92400e] text-2xl">%</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 leading-tight">搜尋者<br />只看第一頁</div>
                  </div>
                  <div className="border-x border-slate-100">
                    <div className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                      3<span className="text-[#92400e] text-2xl">×</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 leading-tight">地圖優化後<br />詢問提升</div>
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                      48<span className="text-[#92400e] text-2xl">h</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 leading-tight">啟動速度<br />業界最快</div>
                  </div>
                </div>
                <Separator className="my-8" />
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-5">
                  <div className="w-12 h-12 bg-[#92400e] rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-800 font-bold">+142% 門店預約率</div>
                    <div className="text-slate-500 text-sm">台北信義區牙醫診所案例</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Teasers */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-14">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>我們做什麼？</h2>
              <div className="w-16 h-0.5 bg-[#92400e]" />
            </div>
            <Link href="/services" className="text-[#92400e] font-semibold text-sm hover:underline hidden md:block">
              查看完整服務方案 →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceCards.map(({ icon: Icon, title, desc, href }) => (
              <Link key={href} href={href} className="card-hover bg-white rounded-xl border border-slate-100 p-7 block group">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-slate-800 transition-colors">
                  <Icon className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/services" className="text-[#92400e] font-semibold text-sm hover:underline">查看完整服務方案 →</Link>
          </div>
        </div>
      </section>

      {/* Trends Teaser */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-12 md:p-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="inline-block text-xs font-bold tracking-widest text-[#92400e] uppercase mb-4">MARKET INTELLIGENCE</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>台灣在地搜尋趨勢</h2>
              <p className="text-slate-500 leading-relaxed max-w-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>你正在面對這些問題嗎？</h2>
            <div className="w-16 h-0.5 bg-[#92400e] mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="card-hover border-slate-100 group">
                <CardContent className="p-10">
                  <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors">
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
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>準備好讓生意起飛了嗎？</h2>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
            填寫諮詢表單，我們在 24 小時內聯繫您，提供免費在地競爭環境評估報告。
          </p>
          <Button asChild size="lg" className="cta-gradient text-white font-bold hover:opacity-90 shadow-xl shadow-amber-900/20 px-12">
            <Link href="/contact">立即免費諮詢 →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
