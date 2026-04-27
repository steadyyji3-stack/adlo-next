'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// 2026-04-23 Lorenzo 決策：工具站改版（方案乙 Rolling 6 週）
// 導航主推：免費工具箱 + 月訂閱 waitlist，舊 /pricing /services /cities 頁面保留吃 SEO 流量
const links = [
  { href: '/', label: '首頁' },
  { href: '/tools', label: '免費工具', badge: 'FREE' },
  { href: '/diagnostic', label: '深度診斷' },
  { href: '/subscribe', label: '月訂閱', badge: 'NEW' },
  { href: '/blog', label: 'SEO 專欄' },
  { href: '/cases', label: '成效案例' },
  { href: '/about', label: '關於我們' },
];

export default function SiteNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo-final.png" alt="adlo" width={248} height={80} style={{ height: '72px', width: 'auto' }} className="object-contain" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? 'text-[#1D9E75] bg-[#E1F5EE] font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {l.label}
              {l.badge && (
                <span className="absolute -top-1 -right-1 bg-[#1D9E75] text-white text-[9px] font-extrabold px-1 py-0.5 rounded leading-none">
                  {l.badge}
                </span>
              )}
            </Link>
          ))}
          <Button asChild className="ml-3 cta-gradient text-white hover:opacity-90 shadow-md">
            <Link href="/contact" data-gtm-event="nav_contact_cta_click">立即諮詢</Link>
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">開啟選單</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 pt-12">
            <nav className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.href)
                      ? 'text-[#1D9E75] bg-[#E1F5EE] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {l.label}
                    {l.badge && (
                      <span className="bg-[#1D9E75] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none">
                        {l.badge}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
              <Button asChild className="mt-4 cta-gradient text-white hover:opacity-90">
                <Link href="/contact" data-gtm-event="nav_contact_cta_click">立即諮詢</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
