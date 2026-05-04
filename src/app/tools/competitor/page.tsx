import type { Metadata } from 'next';
import CompetitorFlow from '@/components/competitor/CompetitorFlow';
import CompetitorFAQ from '@/components/competitor/CompetitorFAQ';

export const metadata: Metadata = {
  title: '免費 競爭對手雷達圖｜你 vs 同區 3 家，30 秒看清差距 | adlo',
  description:
    '不用註冊。輸入店名 + 關鍵字 + 城市，自動抓同區 3 家對手，做 6 維度雷達比較圖，告訴你哪裡領先、哪裡落後、該先補哪一項。',
  alternates: { canonical: 'https://adlo.tw/tools/competitor' },
  openGraph: {
    title: '你 vs 同區 3 家，一張雷達圖看清。',
    description:
      '同區對手六維度比較。完整度、評論、回覆率、照片、關鍵字、在地排名——一次告訴你該補哪一項。',
    url: 'https://adlo.tw/tools/competitor',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

export default function CompetitorPage() {
  return (
    <>
      <CompetitorFlow />
      <CompetitorFAQ />
    </>
  );
}
