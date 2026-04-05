import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getAllPosts } from '@/lib/posts';
import { Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '在地行銷實戰筆記 | adlo',
  description: '每週解析 Local SEO、GEO、Google 演算法，讓台灣中小企業老闆的生意被更多人找到。',
  alternates: { canonical: 'https://adlo.tw/blog' },
  openGraph: {
    title: '在地行銷實戰筆記 | adlo',
    description: '每週解析 Local SEO、GEO、Google 演算法，讓你的生意被更多人找到。',
    url: 'https://adlo.tw/blog',
  },
};

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'adlo 在地行銷實戰筆記',
  description: '台灣在地行銷實戰知識庫：Local SEO、GEO、Google 商家優化深度解析',
  url: 'https://adlo.tw/blog',
  publisher: { '@id': 'https://adlo.tw/#organization' },
  inLanguage: 'zh-TW',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />

      {/* Hero Header */}
      <section className="bg-white border-b border-slate-100 py-16 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase" variant="outline">
            每週更新
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
            讓生意被找到<br />
            <span className="text-[#1D9E75]">在地行銷實戰筆記</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
            每週深度解析 Local SEO、GEO、Google 演算法動態。<br className="hidden md:block" />
            寫給認真想衝業績的台灣中小企業老闆。
          </p>
        </div>
      </section>

      {/* Article List */}
      <section className="py-14 px-6 md:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-[#1D9E75]/40 hover:shadow-lg transition-all duration-200">
                <div className="md:flex">
                  {/* Cover Image */}
                  <div className="md:w-72 md:shrink-0 relative h-52 md:h-auto overflow-hidden">
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 288px"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge className="text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE]/90 text-xs font-bold backdrop-blur-sm" variant="outline">
                        {post.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
                        <span>{post.publishedAt}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readingTime} 分鐘
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#1D9E75] transition-colors leading-snug" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {post.title}
                      </h2>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{post.description}</p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">#{tag}</span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-[#1D9E75] flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
                        閱讀全文 <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
