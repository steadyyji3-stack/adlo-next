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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <body className={`${inter.variable} ${manrope.variable} ${playfair.variable} font-body antialiased`}>
        <SiteNav />
        <main className="pt-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
