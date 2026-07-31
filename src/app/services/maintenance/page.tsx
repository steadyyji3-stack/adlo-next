import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNewServiceBySlug } from '@/lib/new-services';
import { CheckCircle2, ChevronRight, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

const service = getNewServiceBySlug('maintenance')!;

export const metadata: Metadata = {
  title: service.metaTitle,
  description: service.metaDescription,
  alternates: { canonical: 'https://adlo.tw/services/maintenance' },
  openGraph: {
    title: service.metaTitle,
    description: service.metaDescription,
    url: 'https://adlo.tw/services/maintenance',
    images: [{ url: service.coverImage.url, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: service.metaTitle, description: service.metaDescription },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.metaDescription,
  url: 'https://adlo.tw/services/maintenance',
  provider: { '@id': 'https://adlo.tw/#organization' },
  areaServed: { '@type': 'Country', name: 'Taiwan' },
  serviceType: 'Managed Local Marketing Operations',
  offers: service.packages.map((pkg) => ({
    '@type': 'Offer',
    name: pkg.name,
    price: pkg.price?.replace(/[^\d]/g, ''),
    priceCurrency: 'TWD',
  })),
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: service.faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function MaintenancePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
                <ShieldCheck className="w-5 h-5 text-[#1D9E75]" />
              </div>
              <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold">
                {service.nameEn}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
              你買的不是軟體授權，<br />
              <span className="text-[#1D9E75]">是這套系統持續有效</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mb-8">
              {service.heroDesc}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="cta-gradient text-white shadow-xl hover:opacity-90 h-12 px-7">
                <Link href="/contact?service=maintenance" data-gtm-event="service_cta" data-gtm-service="maintenance">
                  預約深度診斷 <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Link href="#packages"
                className="inline-flex items-center h-12 px-7 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all text-sm font-semibold"
                style={{ backgroundColor: 'transparent' }}>
                查看方案與價格
              </Link>
            </div>
          </div>
        </section>

        {/* 為什麼需要維運 */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-5" style={{ fontFamily: 'var(--font-manrope)' }}>
              為什麼「裝好」不等於「一直有用」
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              多數人以為 AI 導入是一次性工程：裝好、上線、結束。實際上不是。
              <strong className="text-slate-900">模型每季換版、平台政策每季調整、你的人員也會異動</strong>——
              這些變化不會通知你，它們只會讓效果慢慢變差，等到你發現時，通常已經掉了三個月。
            </p>
            <p className="text-slate-600 leading-relaxed">
              部署落差不是一次性的鴻溝，是<strong className="text-slate-900">持續漂移的鴻溝</strong>。
              維運層的存在，就是讓你不需要自己盯著這些變化。
            </p>
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

        {/* 每月交付 */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              每個月你會實際收到什麼
            </h2>
            <p className="text-slate-500 mb-10">不是「有需要再說」，是每月固定交付的四件事。</p>
            <div className="grid md:grid-cols-2 gap-6">
              {service.features.map((f, i) => (
                <article key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] border border-[#1D9E75]/20 flex items-center justify-center mb-4">
                    <RefreshCw className="w-4 h-4 text-[#1D9E75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 方案與價格 */}
        <section id="packages" className="bg-slate-50 py-16 px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              方案與價格
            </h2>
            <p className="text-slate-500 mb-10">維運服務需先完成導入建置。價格透明，不依專案大小浮動。</p>
            <div className="grid md:grid-cols-2 gap-6">
              {service.packages.map(pkg => (
                <div key={pkg.name}
                  className={`rounded-2xl p-7 flex flex-col border ${pkg.badge === '推薦' ? 'bg-[#E1F5EE] border-[#1D9E75]' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-slate-900 text-lg">{pkg.name}</h3>
                    {pkg.badge && (
                      <span className="text-[10px] font-black bg-[#1D9E75] text-white px-2 py-0.5 rounded-full">{pkg.badge}</span>
                    )}
                  </div>
                  {pkg.price && (
                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {pkg.price}
                      </span>
                      <span className="text-sm text-slate-500">{pkg.priceHint}</span>
                    </div>
                  )}
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {pkg.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full cta-gradient text-white hover:opacity-90 font-bold">
                    <Link
                      href={`/contact?service=maintenance&package=${encodeURIComponent(pkg.name)}`}
                      data-gtm-event="service_cta"
                      data-gtm-service="maintenance"
                      data-gtm-package={pkg.name}
                    >
                      預約診斷了解適合方案
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* 不包含 —— 邊界寫清楚，避免範圍蔓延與期待落差 */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white px-6 py-5">
              <p className="text-sm font-bold text-slate-900 mb-2">維運不包含什麼</p>
              <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
                <li>· 廣告投放代操（另計費）</li>
                <li>· 網站改版或開發（提供修正建議，執行由你的網站商負責）</li>
                <li>· 平面設計、影片剪輯</li>
                <li>· <strong className="text-slate-900">特定排名、流量或營收的保證</strong>——這些受演算法與市場競爭影響，我們控制不了</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 流程 */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-10" style={{ fontFamily: 'var(--font-manrope)' }}>
              從診斷到維運
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
                  <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-4 bg-slate-50">
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
            <Badge className="bg-white text-[#0F6E56] border-[#1D9E75]/30 mb-5">先診斷再決定</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
              你的行銷，不該綁在某個人身上
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              先做一次深度診斷，看清楚你現在哪裡在漏。
              <strong className="text-slate-900">診斷費用在後續導入時全額折抵。</strong>
            </p>
            <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-14 px-10 text-base">
              <Link href="/contact?service=maintenance" data-gtm-event="service_cta" data-gtm-service="maintenance">
                預約深度診斷 <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
