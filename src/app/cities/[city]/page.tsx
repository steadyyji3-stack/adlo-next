import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllCities, getCityBySlug } from '@/lib/cities';
import {
  MapPin, Star, TrendingUp, CheckCircle2,
  ChevronRight, ArrowRight, Users, Search,
} from 'lucide-react';

/* ── SSG params ─────────────────────────────────────────────── */
export async function generateStaticParams() {
  return getAllCities().map(c => ({ city: c.slug }));
}

/* ── Metadata（SEO skill: title 30-60, desc 120-160, OG complete） */
export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};

  const ogImage = city.coverImage.url;
  const url = `https://adlo.tw/cities/${city.slug}`;

  return {
    title: city.metaTitle,
    description: city.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription,
      url,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: city.coverImage.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: city.metaTitle,
      description: city.metaDescription,
      images: [ogImage],
    },
  };
}

/* ── JSON-LD schemas ─────────────────────────────────────────── */
function buildSchemas(city: ReturnType<typeof getCityBySlug>) {
  if (!city) return [];
  const url = `https://adlo.tw/cities/${city.slug}`;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': url,
    name: `adlo — ${city.name}在地行銷`,
    description: city.metaDescription,
    url,
    telephone: '',
    email: 'hello@adlo.tw',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: city.region,
    },
    serviceType: ['Local SEO', 'Google Business Profile Optimization', 'Google Ads', 'Meta Ads'],
    priceRange: 'NT$8,800–NT$32,800',
    image: city.coverImage.url,
    sameAs: ['https://adlo.tw'],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://adlo.tw' },
      { '@type': 'ListItem', position: 2, name: '城市服務', item: 'https://adlo.tw/cities' },
      { '@type': 'ListItem', position: 3, name: `${city.name}在地行銷`, item: url },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: city.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return [localBusiness, breadcrumb, faqSchema];
}

/* ── Page Component ─────────────────────────────────────────── */
export default async function CityPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const schemas = buildSchemas(city);

  return (
    <>
      {/* JSON-LD (multiple schemas) */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <main>
        {/* ── Breadcrumb ──────────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="bg-white border-b border-slate-100 px-6 py-3">
          <ol className="max-w-5xl mx-auto flex items-center gap-1.5 text-xs text-slate-400">
            <li><Link href="/" className="hover:text-[#1D9E75] transition-colors">首頁</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link href="/cities" className="hover:text-[#1D9E75] transition-colors">城市服務</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-slate-600 font-medium">{city.name}在地行銷</li>
          </ol>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-slate-900 text-white py-20 px-6 md:px-8"
          style={{
            backgroundImage: `linear-gradient(to bottom right, rgba(15,30,25,0.92), rgba(15,30,25,0.78)), url('${city.coverImage.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-[#34d399]" />
              <Badge className="bg-[#1D9E75]/20 text-[#34d399] border-[#1D9E75]/30 text-xs font-bold">
                {city.region} 專屬服務
              </Badge>
              <span className="text-slate-400 text-xs">{city.competitionNote}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              {city.h1}
              <br />
              <span className="text-[#34d399]">{city.subtitle}</span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mb-8">
              {city.marketProfile}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl">
              {city.stats.map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-[#34d399]">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="cta-gradient text-white shadow-lg hover:opacity-90">
                <Link href="/contact">免費諮詢 {city.name} 方案 <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/pricing">查看定價方案</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Pain Points ─────────────────────────────────────── */}
        <section className="bg-slate-50 py-16 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              {city.name}商家的 3 大在地行銷痛點
            </h2>
            <p className="text-slate-500 mb-8">你不是一個人面對這些問題——但知道問題在哪裡，才能找到突破口。</p>

            <div className="grid md:grid-cols-3 gap-6">
              {city.painPoints.map((p, i) => (
                <article key={i} className="bg-white rounded-2xl border border-slate-200 p-6 card-hover">
                  <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                    <span className="text-red-500 font-black text-sm">{i + 1}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section className="bg-white py-16 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              adlo 為{city.name}商家提供的服務
            </h2>
            <p className="text-slate-500 mb-10">每項服務都針對{city.name}在地市場特性設計，不是套裝、不是模板。</p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Search,
                  title: `${city.name}在地 SEO`,
                  desc: `Google Maps 排名優化、GBP 完整度提升、${city.name}商圈關鍵字佈局。讓你的商家在${city.name}客人搜尋時，穩定出現在前三名。`,
                  href: '/services',
                },
                {
                  icon: TrendingUp,
                  title: `${city.name} Google Ads`,
                  desc: `針對${city.name}目標行政區精準投放，只花在會來消費的客人身上。代管費 NT$5,000 起或預算 15%（取高者）。`,
                  href: '/pricing',
                },
                {
                  icon: Users,
                  title: `${city.name}品牌建立`,
                  desc: `從 Google 商家到官方網站，建立完整的${city.name}在地數位形象。讓第一次看到你的客人，立刻產生信任。`,
                  href: '/services',
                },
              ].map(s => (
                <article key={s.title} className="border border-slate-200 rounded-2xl p-6 card-hover">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-[#1D9E75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <Link href={s.href} className="text-[#1D9E75] text-sm font-semibold hover:underline inline-flex items-center gap-1">
                    了解詳情 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Districts ─────────────────────────────────────────── */}
        <section className="bg-slate-50 py-16 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              {city.name}服務涵蓋行政區
            </h2>
            <p className="text-slate-500 mb-8">我們熟悉{city.name}每個商圈的消費特性與競爭結構。</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {city.districts.map(d => (
                <div key={d.name} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1D9E75] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{d.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="bg-white py-16 px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              {city.name}在地行銷常見問題
            </h2>
            <p className="text-slate-500 mb-10">有疑問很正常——這是{city.name}商家問我們最多的問題。</p>

            <div className="space-y-4">
              {city.faqs.map((faq, i) => (
                <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer font-semibold text-slate-800 hover:bg-slate-50 transition-colors list-none">
                    <span>{faq.q}</span>
                    <Star className="w-4 h-4 text-[#1D9E75] shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-24 px-6 md:px-8 text-white"
          style={{ background: 'linear-gradient(135deg, #0d2b20 0%, #0f3d2b 50%, #112d22 100%)' }}
        >
          {/* decorative glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #1D9E75 0%, transparent 70%)' }} />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <span className="inline-block bg-[#1D9E75]/20 text-[#34d399] border border-[#1D9E75]/30 text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
              {city.name}免費評估
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight" style={{ fontFamily: 'var(--font-manrope)' }}>
              你的{city.name}商家<br />
              <span className="text-[#34d399]">現在在 Google 排第幾？</span>
            </h2>

            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              填寫聯絡表單，我們在 1–2 個工作天內提供你的{city.name}在地 SEO 競爭快照——
              <strong className="text-white">完全免費，不需要先簽約。</strong>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {/* 主要 CTA */}
              <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-14 px-8 text-base">
                <Link href="/contact">
                  立即取得免費評估 <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              {/* 次要連結：純文字樣式，避免 shadcn outline 白底問題 */}
              <Link
                href="/services"
                className="inline-flex items-center gap-2 h-14 px-8 text-base font-semibold rounded-lg border border-white/25 text-white/80 hover:text-white hover:border-white/50 hover:bg-white/8 transition-all"
                style={{ backgroundColor: 'transparent' }}
              >
                查看服務方案
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
