import type { Metadata } from 'next';
import AdWasteFlow from '@/components/ad-waste/AdWasteFlow';
import AdWasteFAQ from '@/components/ad-waste/AdWasteFAQ';
import { AD_WASTE_FAQS } from '@/components/ad-waste/faq-data';
import ToolNextSteps from '@/components/shared/ToolNextSteps';

export const metadata: Metadata = {
  title: '免費 Google 廣告浪費估算器｜30 秒看你每月漏掉多少錢',
  description:
    '不用登入、不碰你的廣告帳戶。選預算區間、勾 7 個現況，30 秒估出每月廣告浪費金額區間＋漏錢原因排行＋今天就能做的修法。台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/tools/ad-waste' },
  openGraph: {
    title: '你的 Google 廣告每月漏掉多少錢？| adlo',
    description:
      '30 秒自評估算：每月廣告浪費金額區間 + 最該先堵的漏錢原因。免費、不用登入。',
    url: 'https://adlo.tw/tools/ad-waste',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: AD_WASTE_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function AdWastePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AdWasteFlow />
      <ToolNextSteps current="ad-waste" />
      <AdWasteFAQ />
    </>
  );
}
