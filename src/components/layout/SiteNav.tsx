'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const links = [
  { href: '/', label: '首頁' },
  { href: '/services', label: '服務方案' },
  { href: '/pricing', label: '定價方案' },
  { href: '/cities', label: '城市服務' },
  { href: '/cases', label: '成效案例' },
  { href: '/blog', label: 'SEO 專欄' },
  { href: '/blog/dan-koe', label: 'Dan Koe 週報', badge: 'NEW' },
  { href: '/trends', label: '趨勢分析' },
  { href: '/process', label: '接單流程' },
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
            <Link href="/contact">立即諮詢</Link>
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
                <Link href="/contact">立即諮詢</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
