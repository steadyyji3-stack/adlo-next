import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNewServiceBySlug } from '@/lib/new-services';
import { CheckCircle2, ChevronRight, ArrowRight, Bot, Zap } from 'lucide-react';

const service = getNewServiceBySlug('ai-management')!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: 'https://adlo.tw/services/ai-management' },
  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: 'https://adlo.tw/services/ai-management',
    images: [{ url: service.coverImage.url, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: service.metaTitle, description: service.metaDescription },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.metaDescription,
  url: 'https://adlo.tw/services/ai-management',
  provider: { '@id': 'https://adlo.tw/#organization' },
  areaServed: { '@type': 'Country', name: 'Taiwan' },
  serviceType: 'AI Automation & Enterprise Agent Development',
};

export default function AIManagementPage() {
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
        <section className="relative overflow-hidden py-20 px-6 md:px-8 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1040 0%, #0f1f3d 50%, #0a1628 100%)' }}>
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-8"
              style={{ background: 'radial-gradient(circle, #1D9E75, transparent 70%)' }} />
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-300" />
              </div>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-400/30 text-xs font-bold">
                {service.nameEn}
              </Badge>
              <span className="text-xs text-slate-400 font-medium bg-[#1D9E75]/20 text-[#34d399] border border-[#1D9E75]/30 px-2 py-0.5 rounded-full">NEW</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              {service.name}<br />
              <span className="text-violet-300">+ 企業 Agent 建立</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mb-8">
              {service.heroDesc}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="cta-gradient text-white shadow-xl hover:opacity-90 h-12 px-7">
                <Link href="/contact?service=ai-management">索取提案 <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Link href="#packages"
                className="inline-flex items-center h-12 px-7 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
                style={{ backgroundColor: 'transparent' }}>
                查看套餐方案
              </Link>
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
                  <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 核心功能 */}
        <section className="bg-white py-16 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              六大核心功能模組
            </h2>
            <p className="text-slate-500 mb-10">每個模組可獨立導入，也可組合成完整的 AI 轉型方案。</p>
            <div className="grid md:grid-cols-2 gap-6">
              {service.features.map((f, i) => (
                <article key={i} className="border border-slate-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
                    <Zap className="w-4 h-4 text-violet-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 套餐 */}
        <section id="packages" className="bg-slate-900 py-16 px-6 md:px-8 text-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              選擇適合的套餐
            </h2>
            <p className="text-slate-400 mb-10">所有套餐均依需求報價，填寫表單後 1–2 個工作天提供提案書。</p>
            <div className="grid md:grid-cols-3 gap-6">
              {service.packages.map(pkg => (
                <div key={pkg.name}
                  className={`rounded-2xl p-6 flex flex-col ${pkg.badge === '推薦' ? 'bg-violet-600 border-2 border-violet-400' : 'bg-slate-800 border border-slate-700'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-bold text-white">{pkg.name}</h3>
                    {pkg.badge && (
                      <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">{pkg.badge}</span>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {pkg.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-violet-300 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                    <Link href={`/contact?service=ai-management&package=${encodeURIComponent(pkg.name)}`}>
                      索取此套餐報價
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 執行流程 */}
        <section className="bg-white py-16 px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-10" style={{ fontFamily: 'var(--font-manrope)' }}>
              我們的執行流程
            </h2>
            <div className="space-y-6">
              {service.process.map(p => (
                <div key={p.step} className="flex gap-5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center font-black text-violet-600 text-sm">
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
        <section className="py-20 px-6 md:px-8 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1040 0%, #0f1f3d 100%)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-400/30 mb-5">免費提案</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              讓 AI 開始為你工作
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              告訴我們你的業務流程與痛點，我們提供免費 AI 導入評估，
              <strong className="text-white">找出最有 ROI 的切入點。</strong>
            </p>
            <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-14 px-10 text-base">
              <Link href="/contact?service=ai-management">
                立即索取免費提案 <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
