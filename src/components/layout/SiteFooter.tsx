import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Separator } from '@/components/ui/separator';

const footerLinks = [
  { href: '/', label: '首頁' },
  { href: '/tools', label: '免費工具箱' },
  { href: '/diagnostic', label: '深度診斷' },
  { href: '/subscribe', label: '月訂閱' },
  { href: '/blog', label: 'SEO 專欄' },
  { href: '/cases', label: '成效案例' },
  { href: '/about', label: '關於我們' },
  { href: '/contact', label: '立即諮詢' },
];

const socials = [
  { name: 'X', icon: 'simple-icons:x', href: 'https://x.com/adlo_tw', event: 'social_click', platform: 'x' },
  { name: 'Instagram', icon: 'simple-icons:instagram', href: 'https://instagram.com/adlo.tw', event: 'social_click', platform: 'instagram' },
  { name: 'Facebook', icon: 'simple-icons:facebook', href: 'https://facebook.com/adlo.tw', event: 'social_click', platform: 'facebook' },
  { name: 'LINE', icon: 'simple-icons:line', href: 'https://line.me/ti/p/adlo_tw', event: 'line_click', platform: 'line' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              adlo
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">
              台灣在地 SEO 行銷專家，讓實體店面在 Google 上被看見。
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socials.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  data-gtm-event={s.event}
                  data-gtm-platform={s.platform}
                  data-gtm-location="footer"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1D9E75] hover:text-white transition-all duration-200"
                >
                  <Icon icon={s.icon} width={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <Separator className="bg-slate-800 mb-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-600">© 2026 adlo 數位行銷</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="text-slate-600 hover:text-slate-400 transition-colors">隱私權政策</Link>
            <Link href="/terms" className="text-slate-600 hover:text-slate-400 transition-colors">服務條款</Link>
          </div>
          <p className="text-xs text-slate-700">
            <a href="mailto:hello@adlo.tw" data-gtm-event="email_click" data-gtm-location="footer" className="hover:text-slate-400 transition-colors">hello@adlo.tw</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
