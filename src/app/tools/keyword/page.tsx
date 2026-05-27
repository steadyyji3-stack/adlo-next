import type { Metadata } from 'next';
import KeywordFlow from '@/components/keyword/KeywordFlow';
import KeywordFAQ from '@/components/keyword/KeywordFAQ';

export const metadata: Metadata = {
  title: '免費關鍵字難度檢查｜台灣在地關鍵字 × 搜尋量 × CPC × 決策建議',
  description:
    '一次最多 10 個關鍵字，告訴你每組的月搜尋量、SEO 難度、廣告 CPC，加上「該 SEO、跑廣告、還是跳過」的決策建議。台灣中小店家行銷預算分配工具。',
  alternates: { canonical: 'https://adlo.tw/tools/keyword' },
  openGraph: {
    title: '這個關鍵字值不值得做？— 免費難度檢查工具',
    description:
      '輸入 10 組關鍵字，5 秒拿到搜尋量、SEO 難度、CPC 跟決策建議。台灣中小店家專用。',
    url: 'https://adlo.tw/tools/keyword',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function KeywordPage() {
  return (
    <>
      <KeywordFlow />
      <KeywordFAQ />
    </>
  );
}
