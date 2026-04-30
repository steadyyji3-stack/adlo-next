import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getAllIssues } from '@/lib/dankoe';
import { ArrowRight, Rss, ExternalLink } from 'lucide-react';
import AboutDanKoe from '@/components/dankoe/AboutDanKoe';

export const metadata: Metadata = {
  title: 'Dan Koe 週報 | adlo 在地行銷實戰筆記',
  description: '每週精選 Dan Koe 最新 X 發文，附中文翻譯與台灣在地行銷視角深度解析。一人事業、內容創作、AI 思維，寫給認真做生意的台灣老闆。',
  alternates: { canonical: 'https://adlo.tw/blog/dan-koe' },
  openGraph: {
    title: 'Dan Koe 週報 | adlo',
    description: '每週精選 Dan Koe X 發文翻譯 + 台灣在地行銷解析',
    url: 'https://adlo.tw/blog/dan-koe',
  },
};

const columnJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Dan Koe 週報 by adlo',
  description: '每週精選 Dan Koe X 發文中文翻譯與台灣在地行銷視角解析',
  url: 'https://adlo.tw/blog/dan-koe',
  publisher: { '@id': 'https://adlo.tw/#organization' },
  inLanguage: 'zh-TW',
};

export default function DanKoeColumnPage() {
  const issues = getAllIssues();
  const latest = issues[0];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd) }} />

      {/* Column Hero */}
      <section className="bg-slate-900 text-white py-16 px-6 md:px-8 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-8 left-12 text-[120px] font-black leading-none select-none">DK</div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-[#1D9E75]/20 text-[#34d399] border-[#1D9E75]/40 font-bold text-xs tracking-widest uppercase">
              每週更新
            </Badge>
            <span className="text-slate-400 text-sm flex items-center gap-1.5">
              <Rss className="w-3.5 h-3.5" /> 第 {issues.length} 期已發布
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            Dan Koe 週報
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mb-6">
            每週精選 <a href="https://x.com/thedankoe" target="_blank" rel="noopener noreferrer" className="text-[#34d399] hover:underline inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" />@thedankoe</a> 最新發文，
            附中文翻譯與<strong className="text-white">台灣在地行銷視角</strong>深度解析。
          </p>
          <p className="text-slate-500 text-sm">
            Dan Koe：260萬 X 追蹤 · 年收入超過 $400 萬美元 · 每天工作 2–4 小時
          </p>
        </div>
      </section>

      {/* About Dan Koe — 給第一次來的讀者一個 anchor */}
      <AboutDanKoe variant="full" />

      {/* Latest Issue Highlight */}
      {latest && (
        <section className="border-b border-slate-100 bg-white px-6 md:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">最新一期</p>
            <Link href={`/blog/dan-koe/${latest.week}`} className="group block">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="md:w-64 md:shrink-0 relative h-44 md:h-36 w-full rounded-xl overflow-hidden">
                  <Image
                    src={latest.coverImage.url}
                    alt={latest.coverImage.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 256px"
                    priority
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] text-xs font-bold">
                      第 {latest.issueNumber} 期
                    </Badge>
                    <span className="text-xs text-slate-400">{latest.publishedAt}</span>
                    <span className="text-xs text-slate-400">· {latest.posts.length} 則發文</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-[#1D9E75] transition-colors leading-snug mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {latest.theme}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{latest.summary}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#1D9E75] group-hover:gap-2 transition-all">
                    閱讀本期 <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* All Issues Archive */}
      <section className="py-14 px-6 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-slate-700 mb-6">所有期數</h2>
          <div className="space-y-4">
            {issues.map(issue => (
              <Link key={issue.week} href={`/blog/dan-koe/${issue.week}`} className="group block">
                <div className="bg-white rounded-xl border border-slate-100 hover:border-[#1D9E75]/40 hover:shadow-md transition-all duration-200 p-5 flex items-center gap-5">
                  {/* Issue number */}
                  <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#E1F5EE] transition-colors flex items-center justify-center shrink-0">
                    <span className="text-sm font-extrabold text-slate-500 group-hover:text-[#0F6E56] transition-colors">
                      #{issue.issueNumber}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
                      <span>{issue.publishedAt}</span>
                      <span>·</span>
                      <span>{issue.posts.length} 則翻譯</span>
                    </div>
                    <p className="font-bold text-slate-800 group-hover:text-[#1D9E75] transition-colors truncate text-sm md:text-base">
                      {issue.theme}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1D9E75] group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>

          {/* Coming soon teaser */}
          <div className="mt-4 bg-white rounded-xl border border-dashed border-slate-200 p-5 flex items-center gap-5 opacity-60">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <span className="text-sm font-extrabold text-slate-300">#{issues.length + 1}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">下期預告</p>
              <p className="text-sm text-slate-400">每週更新中，敬請期待⋯⋯</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 md:px-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
            想把 Dan Koe 的思維框架用在你的生意上？
          </h3>
          <p className="text-slate-500 text-sm mb-5">adlo 提供免費在地 SEO + GEO 初步評估，找出最有效的突破口。</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 cta-gradient text-white font-bold rounded-lg px-8 py-3 hover:opacity-90 transition-opacity"
          >
            免費索取評估報告 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
