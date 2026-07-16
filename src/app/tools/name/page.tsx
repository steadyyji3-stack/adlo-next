import type { Metadata } from 'next';
import NameGeneratorFlow from '@/components/name-generator/NameGeneratorFlow';
import NameGeneratorFAQ from '@/components/name-generator/NameGeneratorFAQ';
import ToolNextSteps from '@/components/shared/ToolNextSteps';

export const metadata: Metadata = {
  title: '免費店名 Slogan 產生器｜15 組命名 + 10 組 slogan，每組附說明',
  description:
    '不用註冊。輸入產業、品牌風格、主要客群，AI 一次給你 15 組店名 + 10 組 slogan，每組附「為什麼這個名字能被客人記住」的說明。新品牌命名、老店改 slogan 都能用。',
  alternates: { canonical: 'https://adlo.tw/tools/name' },
  openGraph: {
    title: '免費店名 / Slogan 產生器 | adlo',
    description:
      '輸入產業 + 風格 + 客群，AI 一次給你 15 組店名 + 10 組 slogan，每組附說明。台灣中小店家命名工具。',
    url: 'https://adlo.tw/tools/name',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function NameGeneratorPage() {
  return (
    <>
      <NameGeneratorFlow />
      <ToolNextSteps current="name" />
      <NameGeneratorFAQ />
    </>
  );
}
