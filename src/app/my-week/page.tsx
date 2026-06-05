import type { Metadata } from 'next';
import MyWeekFlow from '@/components/my-week/MyWeekFlow';

export const metadata: Metadata = {
  title: '我的這週｜存一次店家檔案，每週 GBP + LINE 素材自動備好',
  description:
    '不用註冊、不上傳資料。存一次店名 + 產業 + 標籤，之後每次進來，這週的 7 篇 Google 商家貼文 + 7 篇 LINE 推播都幫你準備好。台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/my-week' },
  openGraph: {
    title: '存一次店家檔案，每週素材自動備好',
    description:
      '設定一次，之後每週 14 篇 GBP + LINE 素材直接備好。檔案只存你的瀏覽器，不上傳伺服器。',
    url: 'https://adlo.tw/my-week',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function MyWeekPage() {
  return (
    <main>
      <MyWeekFlow />
    </main>
  );
}
