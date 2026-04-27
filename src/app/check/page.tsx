import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import CheckFlow from '@/components/check/CheckFlow';
import CheckFAQ from '@/components/check/CheckFAQ';
import CheckUpgradeCTA from '@/components/check/CheckUpgradeCTA';

export const metadata: Metadata = {
  title: '免費 Google 商家健檢｜30 秒看懂你的店家幾分 | adlo',
  description: '不用註冊、不抓個資。貼上 Google 地圖連結，30 秒看見你的商家健檢分數與 6 項公開指標。',
  alternates: { canonical: 'https://adlo.tw/check' },
  openGraph: {
    title: '30 秒，看懂你的 Google 商家在客人眼中幾分',
    description: '免費掃描評論、照片、回覆、關鍵字排名。給你一份看得懂、做得動的健檢報告。',
    url: 'https://adlo.tw/check',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function CheckPage() {
  return (
    <>
      <CheckFlow />
      <CheckUpgradeCTA />
      <CheckFAQ />
    </>
  );
}
