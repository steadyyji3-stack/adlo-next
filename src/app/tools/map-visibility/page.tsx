import type { Metadata } from 'next';
import MapVisibilityFlow from '@/components/map-visibility/MapVisibilityFlow';
import MapVisibilityFAQ from '@/components/map-visibility/MapVisibilityFAQ';
import { MAP_VISIBILITY_FAQS } from '@/components/map-visibility/faq-data';
import ToolNextSteps from '@/components/shared/ToolNextSteps';

export const metadata: Metadata = {
  title: '免費 Google 地圖曝光優化清單｜店家被找到的行動待辦',
  description:
    '不用註冊。勾選你的 Google 商家現況，30 秒拿到一份依優先序排好的地圖優化行動清單：先做哪件、為什麼影響在地排名、哪支工具能代勞。台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/tools/map-visibility' },
  openGraph: {
    title: '如何做好你的 Google 地圖顯示 | adlo',
    description:
      '健診告訴你幾分，這支告訴你怎麼補。結構化勾選 → 依優先序的地圖曝光優化行動清單。',
    url: 'https://adlo.tw/tools/map-visibility',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: MAP_VISIBILITY_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function MapVisibilityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MapVisibilityFlow />
      <ToolNextSteps current="map-visibility" />
      <MapVisibilityFAQ />
    </>
  );
}
