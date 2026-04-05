import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/layout/PageHeader';
import { getAllPosts } from '@/lib/posts';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEO 專欄 | adlo 台灣在地行銷',
  description: '最新 Local SEO、GEO 趨勢、Google 演算法分析。台灣中小企業行銷實戰指南，每週更新。',
  alternates: { canonical: 'https://adlo.tw/blog' },
  openGraph: {
    title: 'SEO 專欄 | adlo',
    description: '台灣在地行銷實戰知識庫：Local SEO、GEO、Google 商家優化深度解析。',
    url: 'https://adlo.tw/blog',
  },
};

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'adlo SEO 專欄',
  description: '台灣在地行銷實戰知識庫',
  url: 'https://adlo.tw/blog',
  publisher: { '@id': 'https://adlo.tw/#organization' },
  inLanguage: 'zh-TW',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />

      <PageHeader
        eyebrow="SEO 專欄"
        title="在地行銷實戰知識庫"
        description="Local SEO × GEO × Google 演算法，每週深度解析"
      />

      <section className="py-16 px-6 md:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <Card className="border-slate-100 hover:border-[#1D9E75]/40 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-7">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] text-xs font-bold"
                      >
                        {post.category}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime} 分鐘閱讀
                      </span>
                      <span className="text-xs text-slate-400">{post.publishedAt}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-[#1D9E75] transition-colors leading-snug" style={{ fontFamily: 'var(--font-manrope)' }}>
                      {post.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{post.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">#{tag}</span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-[#1D9E75] flex items-center gap-1 group-hover:gap-2 transition-all">
                      閱讀全文 <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
