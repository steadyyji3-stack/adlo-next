import type { Metadata } from 'next';
import SubscribeHero from '@/components/subscribe/SubscribeHero';
import SubscribePlans from '@/components/subscribe/SubscribePlans';
import SubscribeHowItWorks from '@/components/subscribe/SubscribeHowItWorks';
import SubscribeFAQ from '@/components/subscribe/SubscribeFAQ';

export const metadata: Metadata = {
  title: 'adlo 店家成長訂閱｜每週完成一件最值得做的事',
  description:
    '月繳 NT$2,980，年繳首年 NT$17,880（6 折）。每週一個清楚任務、完成後留下前後結果，系統依觀察調整下一步。30 天免費試用、隨時取消，不需交出 Google 帳號。',
  alternates: { canonical: 'https://adlo.tw/subscribe' },
  openGraph: {
    title: 'adlo 店家成長訂閱｜每週完成一件最值得做的事',
    description: '30 天免費試用，年繳首年 6 折。不用交出 Google 帳號，也不用先學 SEO。',
    url: 'https://adlo.tw/subscribe',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function SubscribePage() {
  return (
    <>
      <SubscribeHero />
      <SubscribePlans />
      <SubscribeHowItWorks />
      <SubscribeFAQ />
    </>
  );
}
