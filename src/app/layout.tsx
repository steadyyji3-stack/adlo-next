import type { Metadata } from 'next';
import { Inter, Manrope, Playfair_Display } from 'next/font/google';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import ClickTracker from '@/components/tracking/ClickTracker';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'adlo — 區域精準行銷，讓客戶主動找上門', template: '%s | adlo' },
  description: '透過 Local SEO 與 GEO 區域精準廣告，為你的實體店面打造自動導流系統。台灣在地 SEO 行銷專家。',
  metadataBase: new URL('https://adlo.tw'),
  alternates: { canonical: 'https://adlo.tw' },
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://adlo.tw',
    siteName: 'adlo 在地行銷',
    title: 'adlo — 區域精準行銷，讓客戶主動找上門',
    description: '透過 Local SEO 與精準廣告，為台灣實體店面打造自動導流系統。',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'adlo 在地行銷' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'adlo — 區域精準行銷，讓客戶主動找上門',
    description: '透過 Local SEO 與精準廣告，為台灣實體店面打造自動導流系統。',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://adlo.tw/#organization',
      name: 'adlo',
      alternateName: 'adlo 在地行銷',
      url: 'https://adlo.tw',
      logo: {
        '@type': 'ImageObject',
        url: 'https://adlo.tw/logo-final.png',
        width: 248,
        height: 80,
      },
      email: 'hello@adlo.tw',
      description: '台灣在地 SEO 行銷專家，專注 Google 商家優化、在地 SEO 佈局、精準廣告投放，讓實體店面客戶主動找上門。',
      foundingLocation: { '@type': 'Country', name: '台灣' },
      areaServed: ['台北市', '新北市', '台中市', '高雄市', '台灣'],
      knowsAbout: ['Local SEO', 'Google Business Profile', 'Google Ads', 'Meta Ads', 'Content Marketing', '在地行銷', 'SEO 優化'],
      sameAs: [],
    },
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': 'https://adlo.tw/#localbusiness',
      name: 'adlo 在地行銷',
      image: 'https://adlo.tw/logo-final.png',
      url: 'https://adlo.tw',
      email: 'hello@adlo.tw',
      priceRange: 'NT$8,800 - NT$32,800/月',
      currenciesAccepted: 'TWD',
      paymentAccepted: '銀行轉帳, 信用卡',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'TW',
        addressRegion: '台灣',
      },
      areaServed: [
        { '@type': 'City', name: '台北市' },
        { '@type': 'City', name: '新北市' },
        { '@type': 'City', name: '台中市' },
        { '@type': 'City', name: '高雄市' },
        { '@type': 'Country', name: '台灣' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: '在地行銷服務方案',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Google 商家檔案優化' },
            price: '8800',
            priceCurrency: 'TWD',
            priceSpecification: { '@type': 'UnitPriceSpecification', unitText: '月' },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: '在地 SEO 深度佈局' },
            price: '18800',
            priceCurrency: 'TWD',
            priceSpecification: { '@type': 'UnitPriceSpecification', unitText: '月' },
          },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: '精準廣告投放全代管' },
            price: '32800',
            priceCurrency: 'TWD',
            priceSpecification: { '@type': 'UnitPriceSpecification', unitText: '月' },
          },
        ],
      },
      parentOrganization: { '@id': 'https://adlo.tw/#organization' },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://adlo.tw/#website',
      url: 'https://adlo.tw',
      name: 'adlo — 區域精準行銷，讓客戶主動找上門',
      description: '透過 Local SEO 與精準廣告，為台灣實體店面打造自動導流系統。',
      publisher: { '@id': 'https://adlo.tw/#organization' },
      inLanguage: 'zh-TW',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://adlo.tw/?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body className={`${inter.variable} ${manrope.variable} ${playfair.variable} font-body antialiased`}>
        <SiteNav />
        <main className="pt-24">{children}</main>
        <SiteFooter />
        {GTM_ID && <ClickTracker />}
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
