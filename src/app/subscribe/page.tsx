import type { Metadata } from 'next';
import SubscribeHero from '@/components/subscribe/SubscribeHero';
import SubscribePlans from '@/components/subscribe/SubscribePlans';
import SubscribeHowItWorks from '@/components/subscribe/SubscribeHowItWorks';
import SubscribeFAQ from '@/components/subscribe/SubscribeFAQ';

export const metadata: Metadata = {
  title: 'adlo 月訂閱方案｜開台優惠 Waitlist 預約中',
  description:
    'GBP Auto、Local SEO Pack、Ads Managed——產品化月訂閱，不賣工時。60 天後正式開台，現在登記 Waitlist 鎖開台優惠。',
  alternates: { canonical: 'https://adlo.tw/subscribe' },
  openGraph: {
    title: 'adlo 月訂閱方案｜Waitlist 預約中',
    description: '產品化月訂閱，不賣工時。登記 Waitlist 鎖開台優惠。',
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
