import type { Metadata } from 'next';
import { Inter, Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

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
  title: 'adlo — 區域精準行銷，讓客戶主動找上門',
  description: '透過 Local SEO 與 GEO 區域精準廣告，為你的實體店面打造自動導流系統。台灣在地 SEO 行銷專家。',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MarketingAgency',
  name: 'adlo 在地行銷',
  alternateName: 'adlo',
  url: 'https://adlo.tw',
  logo: 'https://adlo.tw/logo-final.png',
  description: '台灣在地 SEO 行銷專家，專注 Google 商家優化、在地 SEO 佈局、精準廣告投放，讓實體店面客戶主動找上門。',
  telephone: '',
  email: 'hello@adlo.tw',
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
  serviceType: ['Local SEO', 'Google Business Profile Optimization', 'Google Ads', 'Meta Ads', 'Content Marketing'],
  priceRange: 'NT$8,800 - NT$32,800/月',
  sameAs: [],
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
      <body className={`${inter.variable} ${manrope.variable} ${playfair.variable} font-body antialiased`}>
        <SiteNav />
        <main className="pt-24">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
