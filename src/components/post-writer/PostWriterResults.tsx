'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ImageIcon,
  Copy,
  Check,
  PartyPopper,
  GraduationCap,
  Star,
  Coffee,
  Sparkles,
  Tag,
  HelpCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import type { GeneratedPost, PostCategory } from './mock-data';

interface Props {
  storeName: string;
  posts: GeneratedPost[];
  onReset: () => void;
}

const categoryStyle: Record<
  PostCategory,
  { icon: React.ComponentType<{ className?: string }>; bg: string; text: string }
> = {
  節慶: { icon: PartyPopper, bg: 'bg-amber-50', text: 'text-amber-700' },
  教育: { icon: GraduationCap, bg: 'bg-blue-50', text: 'text-blue-700' },
  客戶見證: { icon: Star, bg: 'bg-yellow-50', text: 'text-yellow-700' },
  幕後: { icon: Coffee, bg: 'bg-slate-100', text: 'text-slate-700' },
  新品: { icon: Sparkles, bg: 'bg-emerald-50', text: 'text-emerald-700' },
  促銷: { icon: Tag, bg: 'bg-rose-50', text: 'text-rose-700' },
  QA: { icon: HelpCircle, bg: 'bg-violet-50', text: 'text-violet-700' },
};

function PostCard({ post }: { post: GeneratedPost }) {
  const [copied, setCopied] = useState(false);
  const style = categoryStyle[post.category];
  const Icon = style.icon;

  function handleCopy() {
    navigator.clipboard.writeText(post.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7 hover:border-emerald-200 hover:shadow-md transition-all">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-slate-900 text-white border-0 font-bold tracking-wide"
          >
            {post.day}
          </Badge>
          <Badge
            variant="outline"
            className={`${style.bg} ${style.text} border-0 font-semibold`}
          >
            <Icon className="w-3 h-3 mr-1 inline" aria-hidden />
            {post.category}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
          <Clock className="w-3.5 h-3.5" aria-hidden />
          建議 {post.bestTime}
        </div>
      </header>

      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 leading-snug">
        {post.title}
      </h3>

      <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line mb-5">
        {post.content}
      </p>

      <div className="flex items-start gap-2 text-xs text-slate-500 mb-5 bg-slate-50 rounded-lg p-3">
        <ImageIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold text-slate-700">建議圖片：</span>
          {post.imageHint}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="text-xs"
          data-gtm-event="post_writer_copy"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" aria-hidden />
              已複製
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" aria-hidden />
              複製文案
            </>
          )}
        </Button>
      </div>
    </article>
  );
}

export default function PostWriterResults({ storeName, posts, onReset }: Props) {
  return (
    <section className="bg-slate-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        {/* Result header */}
        <header className="mb-8 md:mb-12 text-center">
          <Badge className="bg-[#1D9E75] text-white border-0 mb-4">完成 ✓</Badge>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight">
            <span className="text-[#1D9E75]">{storeName}</span> 下週的 7 篇貼文
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            這是初稿——直接複製、或挑你喜歡的微調再發。
          </p>
        </header>

        {/* 7 cards */}
        <div className="space-y-4 md:space-y-5">
          {posts.map((post, idx) => (
            <PostCard key={idx} post={post} />
          ))}
        </div>

        {/* Reset CTA */}
        <div className="mt-10 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="text-sm"
            data-gtm-event="post_writer_reset"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" aria-hidden />
            換一家店再產一次
          </Button>
        </div>

        {/* 底部三推薦（符合 sticky-tools §2.5） */}
        <div className="mt-16 grid md:grid-cols-3 gap-4">
          <Link
            href="/check"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="post_writer_to_check"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 相關工具</div>
            <div className="font-bold text-slate-900 mb-1">先測 GBP 分數</div>
            <div className="text-xs text-slate-600 mb-3">
              30 秒看你家 Google 商家幾分，找出最弱那項
            </div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              GBP 健診 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/blog/google-business-profile-6d-health-check-taiwan-2026"
            className="group bg-white rounded-xl border border-slate-200 hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="post_writer_to_blog"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 延伸閱讀</div>
            <div className="font-bold text-slate-900 mb-1">GBP 六維度健檢清單</div>
            <div className="text-xs text-slate-600 mb-3">
              台灣中小店家 2026 GBP 優化完整教學
            </div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              閱讀文章 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/diagnostic"
            className="group bg-white rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-[#1D9E75] hover:shadow-md transition-all p-5"
            data-gtm-event="post_writer_to_diagnostic"
          >
            <div className="text-xs font-bold text-emerald-700 mb-2">→ 想要專人協助</div>
            <div className="font-bold text-slate-900 mb-1">預約 30 分鐘深度診斷</div>
            <div className="text-xs text-slate-600 mb-3">
              7 篇還不夠？我們直接看你的 GBP 給你客製建議
            </div>
            <span className="text-xs text-[#1D9E75] font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              免費預約 <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
