import type { Metadata } from 'next';
import LineBroadcastFlow from '@/components/line-broadcast/LineBroadcastFlow';
import LineBroadcastFAQ from '@/components/line-broadcast/LineBroadcastFAQ';

export const metadata: Metadata = {
  title: '免費 LINE 推播文案產生器｜下週 7 天 LINE OA 推播 3 秒寫完',
  description:
    '不用註冊。輸入店名 + 產業，3 秒產出 7 篇 LINE OA 推播初稿（歡迎/教育/QA/幕後/新品/促銷/節慶）。附建議推播時段、字數、6 個避免被封鎖的紅線檢查。',
  alternates: { canonical: 'https://adlo.tw/tools/line-broadcast' },
  openGraph: {
    title: '下週 7 天 LINE 推播，3 秒寫完',
    description:
      '不是 AI 自動發，是給你寫好的初稿。每篇附建議推播時段 + 6 個避免被客人封鎖的紅線。',
    url: 'https://adlo.tw/tools/line-broadcast',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function LineBroadcastPage() {
  return (
    <>
      <LineBroadcastFlow />
      <LineBroadcastFAQ />
    </>
  );
}
