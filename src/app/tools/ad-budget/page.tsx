import type { Metadata } from 'next';
import AdBudgetFlow from '@/components/ad-budget/AdBudgetFlow';
import AdBudgetFAQ from '@/components/ad-budget/AdBudgetFAQ';
import { AD_BUDGET_FAQS } from '@/components/ad-budget/faq-data';

export const metadata: Metadata = {
  title: '免費 Google 廣告該不該投試算機｜損益兩平 CPC、ROAS 一次算',
  description:
    '不用註冊。用你的客單價、毛利率、轉換率、CPC，30 秒算出每次點擊最多能付多少還不虧、損益兩平 ROAS、每月預估淨利。別等燒完一個月才發現一直在賠。台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/tools/ad-budget' },
  openGraph: {
    title: '該不該投 Google 廣告？先算清楚 | adlo',
    description:
      '用你自己的數字算出損益兩平點：每次點擊最多能付多少還不虧。純試算、不上傳資料。',
    url: 'https://adlo.tw/tools/ad-budget',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: AD_BUDGET_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function AdBudgetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AdBudgetFlow />
      <AdBudgetFAQ />
    </>
  );
}
