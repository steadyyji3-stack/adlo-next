import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllCities } from '@/lib/cities';
import { MapPin, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '城市在地行銷服務 | adlo',
  description: 'adlo 提供台北、台中、高雄城市專屬在地 SEO 與廣告服務。根據各城市競爭結構與消費特性，制定最有效的在地行銷策略。',
  alternates: { canonical: 'https://adlo.tw/cities' },
  openGraph: {
    title: '城市在地行銷服務 | adlo',
    description: 'adlo 提供台北、台中、高雄城市專屬在地 SEO 與廣告服務。',
    url: 'https://adlo.tw/cities',
    type: 'website',
  },
};

const competitionColor: Record<string, string> = {
  taipei:    'text-orange-400',
  taichung:  'text-amber-400',
  kaohsiung: 'text-[#34d399]',
};

export default function CitiesPage() {
  const cities = getAllCities();

  return (
    <main>
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-16 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <Badge className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
            城市專屬服務
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            你在哪個城市做生意？
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            台北、台中、高雄——每個城市的競爭結構、消費習慣、搜尋行為都不同。
            選擇你的城市，看我們針對你的市場準備了什麼。
          </p>
        </div>
      </section>

      {/* City Cards */}
      <section className="py-14 px-6 md:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {cities.map(city => (
            <article
              key={city.slug}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover flex flex-col"
            >
              {/* Cover — fixed h-44, shrink-0 prevents flex compression */}
              <div
                className="h-44 relative shrink-0 overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(15,25,20,0.15), rgba(15,25,20,0.80)), url('${city.coverImage.url}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-4 h-4 text-[#34d399] shrink-0" />
                    <span className="font-extrabold text-xl" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {city.name}
                    </span>
                  </div>
                  <p className={`text-[11px] font-bold mt-1 line-clamp-1 ${competitionColor[city.slug]}`}>
                    {city.competitionNote}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
                  {city.marketProfile}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {city.stats.map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-base font-black text-[#1D9E75]">{s.value}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full cta-gradient text-white hover:opacity-90 mt-auto">
                  <Link href={`/cities/${city.slug}`}>
                    {city.name}服務詳情 <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white py-14 px-6 md:px-8 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
            你的城市不在列表內？
          </h2>
          <p className="text-slate-500 mb-6">
            adlo 也服務新竹、桃園、台南等城市。告訴我們你在哪裡，我們會評估是否能提供服務。
          </p>
          <Button asChild className="cta-gradient text-white shadow-md hover:opacity-90">
            <Link href="/contact">聯絡我們 <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
