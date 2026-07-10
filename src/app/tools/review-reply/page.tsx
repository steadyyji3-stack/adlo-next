import type { Metadata } from 'next';
import ReviewReplyFlow from '@/components/review-reply/ReviewReplyFlow';
import ReviewReplyFAQ from '@/components/review-reply/ReviewReplyFAQ';
import { REVIEW_REPLY_FAQS } from '@/components/review-reply/faq-data';

export const metadata: Metadata = {
  title: '免費評論回覆產生器｜Google 評論 3 種回覆，好評負評都能回',
  description:
    '不用註冊。貼上客人的 Google 商家評論，30 秒產出 3 種語氣的回覆初稿——好評加溫、負評不失風度。回覆率是在地排名訊號，台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/tools/review-reply' },
  openGraph: {
    title: '收到評論，3 種回覆幫你寫好 | adlo',
    description:
      '貼上評論 → 3 種語氣回覆初稿。好評加溫、負評不失風度，公開回覆是寫給下一個客人看的。',
    url: 'https://adlo.tw/tools/review-reply',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: REVIEW_REPLY_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function ReviewReplyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ReviewReplyFlow />
      <ReviewReplyFAQ />
    </>
  );
}
