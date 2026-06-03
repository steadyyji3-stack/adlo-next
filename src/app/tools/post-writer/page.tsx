import type { Metadata } from 'next';
import PostWriterFlow from '@/components/post-writer/PostWriterFlow';
import PostWriterFAQ from '@/components/post-writer/PostWriterFAQ';

export const metadata: Metadata = {
  title: '免費 GBP 貼文產生器｜下週 7 天 Google 商家貼文，3 秒搞定',
  description:
    '不用註冊。輸入店名 + 產業 + 點幾個標籤，3 秒產出一週 7 篇 Google 商家貼文初稿。節慶、教育、客戶見證、幕後、新品、促銷、QA 自動配。台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/tools/post-writer' },
  openGraph: {
    title: '下週 7 天的 Google 商家貼文，3 秒產出。',
    description:
      '不是 AI 聊天工具——結構化標籤點選，給你寫好的初稿。節慶、教育、客戶見證、幕後、新品、促銷、QA 一週分齊全。',
    url: 'https://adlo.tw/tools/post-writer',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function PostWriterPage() {
  return (
    <main>
      <PostWriterFlow />
      <PostWriterFAQ />
    </main>
  );
}
