import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getIssueByWeek, getAllIssues, getAdjacentIssues } from '@/lib/dankoe';
import { ArrowLeft, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ShareButtons from '@/components/blog/ShareButtons';
import AboutDanKoe from '@/components/dankoe/AboutDanKoe';

interface Props { params: Promise<{ week: string }> }

export async function generateStaticParams() {
  return getAllIssues().map(i => ({ week: i.week }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { week } = await params;
  const issue = getIssueByWeek(week);
  if (!issue) return {};
  return {
    title: `Dan Koe 週報 第${issue.issueNumber}期：${issue.theme}`,
    description: issue.summary,
    alternates: { canonical: `https://adlo.tw/blog/dan-koe/${issue.week}` },
    openGraph: {
      title: `Dan Koe 週報 #${issue.issueNumber} | adlo`,
      description: issue.summary,
      url: `https://adlo.tw/blog/dan-koe/${issue.week}`,
      type: 'article',
      publishedTime: issue.publishedAt,
      images: [{ url: issue.coverImage.url, alt: issue.coverImage.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Dan Koe 週報 #${issue.issueNumber}`,
      description: issue.summary,
      images: [issue.coverImage.url],
    },
  };
}

export default async function DanKoeIssuePage({ params }: Props) {
  const { week } = await params;
  const issue = getIssueByWeek(week);
  if (!issue) notFound();

  const { prev, next } = getAdjacentIssues(week);
  const pageUrl = `https://adlo.tw/blog/dan-koe/${issue.week}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Dan Koe 週報 第${issue.issueNumber}期：${issue.theme}`,
    description: issue.summary,
    image: issue.coverImage.url,
    datePublished: issue.publishedAt,
    author: { '@type': 'Organization', name: 'adlo 編輯部', url: 'https://adlo.tw' },
    publisher: { '@id': 'https://adlo.tw/#organization' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    inLanguage: 'zh-TW',
    url: pageUrl,
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        {/* Hero */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-slate-900">
          <Image
            src={issue.coverImage.url}
            alt={issue.coverImage.alt}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

          {/* Issue badge overlay */}
          <div className="absolute bottom-6 left-6 md:left-8">
            <Badge className="bg-[#1D9E75] text-white border-0 font-bold text-xs mb-2">
              第 {issue.issueNumber} 期
            </Badge>
            <p className="text-xs text-white/50">
              Photo by{' '}
              <a href={issue.coverImage.creditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 underline">
                {issue.coverImage.credit}
              </a>
              {' '}on Unsplash
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-10 pb-24">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/blog" className="hover:text-[#1D9E75] transition-colors">實戰筆記</Link>
            <span>/</span>
            <Link href="/blog/dan-koe" className="hover:text-[#1D9E75] transition-colors">Dan Koe 週報</Link>
            <span>/</span>
            <span className="text-slate-500">第 {issue.issueNumber} 期</span>
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] text-xs font-bold">
                Dan Koe 週報
              </Badge>
              <span className="text-xs text-slate-400">{issue.publishedAt}</span>
              <span className="text-xs text-slate-400">· {issue.posts.length} 則翻譯</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              {issue.theme}
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">{issue.summary}</p>
          </header>

          <Separator className="mb-10" />

          {/* Posts */}
          <div className="space-y-14">
            {issue.posts.map((post, idx) => (
              <div key={post.id} className="relative">

                {/* Post number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-xs font-extrabold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {post.postedAt && (
                    <span className="text-xs text-slate-400">{post.postedAt}</span>
                  )}
                  {post.xUrl && (
                    <a
                      href={post.xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-[#1D9E75] flex items-center gap-1 transition-colors ml-auto"
                    >
                      原文 <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Original tweet card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">
                      DK
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none">Dan Koe</p>
                      <p className="text-xs text-slate-400">@thedankoe</p>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed italic">
                    {post.original}
                  </p>
                </div>

                {/* Translation */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">中文翻譯</p>
                  <p className="text-slate-700 leading-relaxed">{post.translation}</p>
                </div>

                {/* Insight */}
                <div className="border-l-4 border-[#1D9E75] pl-4">
                  <p className="text-xs font-bold text-[#0F6E56] uppercase tracking-widest mb-2">adlo 解析</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{post.insight}</p>
                </div>

              </div>
            ))}
          </div>

          <Separator className="my-12" />

          {/* Prev / Next navigation */}
          <nav className="grid grid-cols-2 gap-4 mb-12" aria-label="期數導覽">
            {prev ? (
              <Link href={`/blog/dan-koe/${prev.week}`} className="group flex flex-col gap-1 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#1D9E75]/40 hover:bg-[#E1F5EE]/40 transition-all">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" /> 上一期 #{prev.issueNumber}
                </span>
                <span className="text-sm font-bold text-slate-700 group-hover:text-[#1D9E75] transition-colors line-clamp-2">
                  {prev.theme}
                </span>
              </Link>
            ) : <div />}

            {next ? (
              <Link href={`/blog/dan-koe/${next.week}`} className="group flex flex-col gap-1 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#1D9E75]/40 hover:bg-[#E1F5EE]/40 transition-all text-right">
                <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                  下一期 #{next.issueNumber} <ChevronRight className="w-3 h-3" />
                </span>
                <span className="text-sm font-bold text-slate-700 group-hover:text-[#1D9E75] transition-colors line-clamp-2">
                  {next.theme}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 opacity-50 text-right">
                <span className="text-xs text-slate-400">下一期</span>
                <span className="text-sm text-slate-400">每週更新中⋯</span>
              </div>
            )}
          </nav>

          {/* About Dan Koe (compact)：第一次來的讀者快速了解作者 */}
          <AboutDanKoe variant="compact" />

          {/* Share */}
          <ShareButtons title={`Dan Koe 週報 第${issue.issueNumber}期：${issue.theme}`} url={pageUrl} />

          {/* Back to column */}
          <div className="mt-8 text-center">
            <Link href="/blog/dan-koe" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#1D9E75] transition-colors">
              <ArrowLeft className="w-4 h-4" /> 查看所有期數
            </Link>
          </div>

          {/* CTA */}
          <div className="mt-10 bg-[#E1F5EE] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              想把這些思維用在你的在地行銷上？
            </h3>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              adlo 提供免費在地 SEO + GEO 初步評估，找出你的競爭缺口，不推銷、無壓力。
            </p>
            <Button asChild className="cta-gradient text-white font-bold hover:opacity-90 px-10">
              <Link href="/contact">免費索取評估報告 →</Link>
            </Button>
          </div>

        </div>
      </article>
    </>
  );
}
