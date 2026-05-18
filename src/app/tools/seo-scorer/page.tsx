import type { Metadata } from 'next';
import SeoScorerFlow from '@/components/seo-scorer/SeoScorerFlow';
import SeoScorerFAQ from '@/components/seo-scorer/SeoScorerFAQ';

export const metadata: Metadata = {
  title: '免費 SEO 文章計分器｜貼 URL 即時拿 10 維度分數 + 3 個最該先改 | adlo',
  description:
    '不用註冊。貼一個部落格文章 URL，我們真的抓你的 HTML 計算 title、H1、字數、圖片 alt、meta、連結結構、canonical、schema 共 10 維度 SEO 分數，告訴你最該先改的 3 件事。',
  alternates: { canonical: 'https://adlo.tw/tools/seo-scorer' },
  openGraph: {
    title: '貼一個 URL，即時拿 SEO 分數',
    description:
      '10 維度評分，3 個最該先改的。真的讀你的 HTML，不是 AI 猜。',
    url: 'https://adlo.tw/tools/seo-scorer',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function SeoScorerPage() {
  return (
    <>
      <SeoScorerFlow />
      <SeoScorerFAQ />
    </>
  );
}
