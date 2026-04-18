import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { Clock, ArrowLeft } from 'lucide-react';
import ShareButtons from '@/components/blog/ShareButtons';
import ReadingProgress from '@/components/blog/ReadingProgress';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://adlo.tw/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://adlo.tw/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: post.coverImage.url, alt: post.coverImage.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.coverImage.url],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const postUrl = `https://adlo.tw/blog/${post.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.coverImage.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://adlo.tw',
    },
    publisher: { '@id': 'https://adlo.tw/#organization' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    keywords: post.tags.join(', '),
    inLanguage: 'zh-TW',
    url: postUrl,
  };

  const faqJsonLd = post.faqSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqSchema.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <article>
        {/* Hero Image */}
        <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden bg-slate-900">
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          {/* Photo credit */}
          <p className="absolute bottom-3 right-4 text-xs text-white/50">
            Photo by{' '}
            <a href={post.coverImage.creditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 underline">
              {post.coverImage.credit}
            </a>
            {' '}on Unsplash
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-10 pb-24">

          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#1D9E75] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> 返回實戰筆記
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] text-xs font-bold">
                {post.category}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readingTime} 分鐘閱讀
              </span>
              <span className="text-xs text-slate-400">{post.publishedAt}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
              {post.title}
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">{post.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">#{tag}</span>
              ))}
            </div>
          </header>

          <Separator className="mb-10" />

          {/* Content */}
          <div
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-slate-800
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-5
              prose-strong:text-slate-800
              prose-blockquote:border-l-[#1D9E75] prose-blockquote:bg-[#E1F5EE]/60 prose-blockquote:rounded-r-lg prose-blockquote:py-1
              prose-code:text-[#0F6E56] prose-code:bg-[#E1F5EE] prose-code:px-1.5 prose-code:rounded prose-code:font-medium
              [&_.lead]:text-xl [&_.lead]:text-slate-600 [&_.lead]:font-medium [&_.lead]:leading-relaxed [&_.lead]:mb-6
              [&_.cta-box]:bg-[#E1F5EE] [&_.cta-box]:border [&_.cta-box]:border-[#1D9E75]/30 [&_.cta-box]:rounded-xl [&_.cta-box]:p-6 [&_.cta-box]:mt-10 [&_.cta-box]:text-slate-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Separator className="my-12" />

          {/* Share */}
          <ShareButtons title={post.title} url={postUrl} />

          {/* CTA */}
          <div className="mt-10 bg-[#E1F5EE] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'var(--font-manrope)' }}>
              想了解你的網站 GEO 能見度？
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
