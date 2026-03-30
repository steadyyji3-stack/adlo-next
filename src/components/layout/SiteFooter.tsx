import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const footerLinks = [
  { href: '/', label: '首頁' },
  { href: '/services', label: '服務方案' },
  { href: '/trends', label: '趨勢分析' },
  { href: '/process', label: '接單流程' },
  { href: '/contact', label: '立即諮詢' },
  { href: '/admin', label: '後台管理' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div>
            <div
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              adlo
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              台灣在地 SEO 行銷專家，讓實體店面在 Google 上被看見。
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="bg-slate-800 mb-6" />
        <p className="text-xs text-slate-600">© 2026 adlo 區域精準行銷</p>
      </div>
    </footer>
  );
}
