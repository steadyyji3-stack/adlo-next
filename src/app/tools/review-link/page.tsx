import type { Metadata } from 'next';
import ReviewLinkFlow from '@/components/review-link/ReviewLinkFlow';
import ReviewLinkFAQ from '@/components/review-link/ReviewLinkFAQ';

export const metadata: Metadata = {
  title: '免費評論收集連結 + QR Code + 訊息模板｜3 秒產出全套素材 | adlo',
  description:
    '不用註冊。貼上你 Google 商家評論連結，3 秒產出 QR Code 跟 6 套訊息模板（LINE / 紙卡 / Email × 2 風格），讓客人少打 5 步驟就能寫評論。',
  alternates: { canonical: 'https://adlo.tw/tools/review-link' },
  openGraph: {
    title: '評論收集全套素材，3 秒搞定',
    description:
      'QR Code + 6 套訊息模板，套你的店名跟產業。台灣中小店家從 0 累積評論的最便宜方法。',
    url: 'https://adlo.tw/tools/review-link',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function ReviewLinkPage() {
  return (
    <>
      <ReviewLinkFlow />
      <ReviewLinkFAQ />
    </>
  );
}
