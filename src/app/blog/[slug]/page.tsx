import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import { Clock, ArrowLeft, Share2 } from 'lucide-react';
import ShareButtons from '@/components/blog/ShareButtons';

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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article className="pt-12 pb-24 px-6 md:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#1D9E75] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> 返回專欄
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
            <h1
              className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
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
              prose-blockquote:border-l-[#1D9E75] prose-blockquote:bg-[#E1F5EE] prose-blockquote:rounded-r-lg prose-blockquote:py-1
              prose-code:text-[#0F6E56] prose-code:bg-[#E1F5EE] prose-code:px-1 prose-code:rounded
              [&_.lead]:text-xl [&_.lead]:text-slate-600 [&_.lead]:font-medium [&_.lead]:leading-relaxed
              [&_.cta-box]:bg-[#E1F5EE] [&_.cta-box]:border [&_.cta-box]:border-[#1D9E75]/30 [&_.cta-box]:rounded-xl [&_.cta-box]:p-6 [&_.cta-box]:mt-10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Separator className="my-12" />

          {/* Share + CTA */}
          <div className="space-y-8">
            <ShareButtons title={post.title} url={postUrl} />

            <div className="bg-[#E1F5EE] rounded-2xl p-8 text-center">
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

        </div>
      </article>
    </>
  );
}
