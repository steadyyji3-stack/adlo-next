import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNewServiceBySlug } from '@/lib/new-services';
import { CheckCircle2, ChevronRight, ArrowRight, BarChart2, Zap } from 'lucide-react';

const service = getNewServiceBySlug('market-research')!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: 'https://adlo.tw/services/market-research' },
  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: 'https://adlo.tw/services/market-research',
    images: [{ url: service.coverImage.url, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: service.metaTitle, description: service.metaDescription },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.metaDescription,
  url: 'https://adlo.tw/services/market-research',
  provider: { '@id': 'https://adlo.tw/#organization' },
  areaServed: { '@type': 'Country', name: 'Taiwan' },
  serviceType: 'Digital Market Research & Competitor Analysis',
};

/* Mock survey demo data */
const demoData = [
  { label: '陶瓷貼片', pct: 42, searches: 2400 },
  { label: '居家冷光', pct: 28, searches: 1600 },
  { label: '診所冷光', pct: 18, searches: 1020 },
  { label: '噴砂潔牙', pct: 12, searches: 680 },
];

export default function MarketResearchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="bg-white border-b border-slate-100 px-6 py-3">
          <ol className="max-w-5xl mx-auto flex items-center gap-1.5 text-xs text-slate-400">
            <li><Link href="/" className="hover:text-[#1D9E75] transition-colors">首頁</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link href="/services" className="hover:text-[#1D9E75] transition-colors">服務方案</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-600 font-medium">{service.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#E1F5EE] via-white to-slate-50 py-20 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[#1D9E75]" />
              </div>
              <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold">
                {service.nameEn}
              </Badge>
              <span className="text-xs font-medium bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">NEW</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
              {service.name}<br />
              <span className="text-[#1D9E75]">AI 模擬 × 數據說話</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mb-8">
              {service.heroDesc}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="cta-gradient text-white shadow-xl hover:opacity-90 h-12 px-7">
                <Link href="/contact?service=market-research">索取提案 <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Link href="#packages"
                className="inline-flex items-center h-12 px-7 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all text-sm font-semibold"
                style={{ backgroundColor: 'transparent' }}>
                查看套餐方案
              </Link>
            </div>
          </div>
        </section>

        {/* AI 模擬市調 DEMO */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold">核心特色</Badge>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
                  不問 1,000 人<br />一樣拿到市調結果
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  傳統問卷需要數週、數萬元，且樣本可能失真。
                  我們用搜尋行為數據 + 社群聲量 + AI 合成，
                  在數天內產出等效的「模擬市調報告」——
                  <strong className="text-slate-700">搜尋量即民調，行為數據比問卷更誠實。</strong>
                </p>
                <div className="space-y-2 text-sm text-slate-600">
                  {['Google 搜尋量（真實選擇偏好）', 'PTT / Dcard 社群討論情緒', '競爭對手廣告投放驗證', 'AI 合成為問卷格式報告'].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo chart */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs text-slate-400 font-medium mb-1">模擬市調報告範例</p>
                <p className="font-bold text-slate-800 mb-1">台北 · 牙齒美白市場偏好調查</p>
                <p className="text-xs text-slate-400 mb-5">資料來源：Google Keyword Planner + PTT 討論量 · AI 合成</p>
                <div className="space-y-4">
                  {demoData.map((d, i) => (
                    <div key={d.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{d.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{d.searches.toLocaleString()} 次/月</span>
                          <span className="text-sm font-bold text-slate-800">{d.pct}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.pct}%`,
                            background: i === 0 ? '#1D9E75' : i === 1 ? '#34d399' : i === 2 ? '#6ee7b7' : '#a7f3d0',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-5 leading-relaxed">
                  ＊ 此為示意模擬數據，實際報告依真實搜尋量與社群聲量產出。
                  原始問卷費用約 NT$30,000–80,000；本服務以數據分析取代。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 適合對象 */}
        <section className="bg-slate-50 py-14 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
              這項服務適合你嗎？
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {service.targets.map(t => (
                <div key={t} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1D9E75] mt-0.5 shrink-0" />
                  <p className="text-slate-700 text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 核心功能 */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              六大市調分析模組
            </h2>
            <p className="text-slate-500 mb-10">從搜尋數據到社群聆聽，給你做決策真正需要的數字。</p>
            <div className="grid md:grid-cols-2 gap-6">
              {service.features.map((f, i) => (
                <article key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-[#1D9E75]/40 hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] border border-[#1D9E75]/20 flex items-center justify-center mb-4">
                    <Zap className="w-4 h-4 text-[#1D9E75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 套餐 */}
        <section id="packages" className="bg-slate-50 py-16 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              選擇適合的市調套餐
            </h2>
            <p className="text-slate-500 mb-10">所有套餐均依需求報價，填寫表單後 1–2 個工作天提供提案書。</p>
            <div className="grid md:grid-cols-3 gap-6">
              {service.packages.map(pkg => (
                <div key={pkg.name}
                  className={`rounded-2xl p-6 flex flex-col border ${pkg.badge === '最多人選' ? 'bg-[#E1F5EE] border-[#1D9E75]' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                    {pkg.badge && (
                      <span className="text-[10px] font-black bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">{pkg.badge}</span>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {pkg.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full cta-gradient text-white hover:opacity-90 font-bold">
                    <Link href={`/contact?service=market-research&package=${encodeURIComponent(pkg.name)}`}>
                      索取此套餐報價
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 執行流程 */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-10" style={{ fontFamily: 'var(--font-manrope)' }}>
              我們的市調流程
            </h2>
            <div className="space-y-6">
              {service.process.map(p => (
                <div key={p.step} className="flex gap-5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/30 flex items-center justify-center font-black text-[#1D9E75] text-sm">
                    {p.step}
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-slate-900 mb-1">{p.title}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 py-16 px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8" style={{ fontFamily: 'var(--font-manrope)' }}>
              常見問題
            </h2>
            <div className="space-y-3">
              {service.faqs.map((faq, i) => (
                <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer font-semibold text-slate-800 hover:bg-slate-50 transition-colors list-none">
                    <span>{faq.q}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 md:px-8 bg-[#E1F5EE]">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white text-[#0F6E56] border-[#1D9E75]/30 mb-5">免費提案</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
              在決策前，先看清數字
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              告訴我們你的產品與目標市場，我們提供免費市調範圍評估，
              <strong className="text-slate-900">讓每一個行銷決策都有數據支撐。</strong>
            </p>
            <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-14 px-10 text-base">
              <Link href="/contact?service=market-research">
                立即索取免費提案 <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
