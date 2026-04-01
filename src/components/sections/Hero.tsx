'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, MapPin, Clock, Star } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const stats = [
  { value: '92', unit: '%', label: '搜尋者\n只看第一頁', icon: Star },
  { value: '3', unit: '×', label: '地圖優化後\n詢問提升', icon: TrendingUp },
  { value: '48', unit: 'h', label: '啟動速度\n業界最快', icon: Clock },
];

export default function Hero() {
  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-white">
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(29,158,117,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-5%,rgba(29,158,117,0.08),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-14 items-center"
        >
          {/* Left: Copy */}
          <div>
            {/* Social proof badge */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
                <span className="text-[#0F6E56] text-xs font-bold tracking-widest uppercase">
                  台北信義區牙醫 +142% 門店預約率
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              讓 Google 地圖<br />
              <span className="text-[#1D9E75]">把客戶送到你門口</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} className="text-lg text-slate-500 leading-relaxed mb-4 max-w-lg">
              adlo 專攻區域精準行銷。從 Google 商家優化到在地 SEO，
              我們只服務認真想衝業績的老闆。
            </motion.p>

            {/* Tags */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-10">
              {['Google 搜尋排名第一', '附近顧客主動找上門', '精準在地廣告', '快速 48h 啟動'].map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs text-slate-500 bg-slate-100">
                  {tag}
                </Badge>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="cta-gradient text-white hover:opacity-90 shadow-lg shadow-green-900/20 font-bold text-base px-8"
              >
                <Link href="/contact">免費諮詢，限量 5 名 →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold text-base border-slate-200 hover:border-[#1D9E75] hover:text-[#1D9E75]">
                <Link href="/services">查看服務方案</Link>
              </Button>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-3 text-slate-400 text-sm">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span>專注台灣在地市場 · 24h 快速回覆 · 無效退款保障</span>
            </motion.div>
          </div>

          {/* Right: Stats card */}
          <motion.div variants={fadeIn} className="hidden md:block">
            <Card className="shadow-2xl shadow-slate-200/60 border-slate-100 rounded-2xl overflow-hidden">
              <CardContent className="p-10">
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-8">實績數據</p>
                <div className="grid grid-cols-3 gap-6 text-center">
                  {stats.map(({ value, unit, label }, i) => (
                    <div key={i} className={i !== 0 ? 'border-l border-slate-100' : ''}>
                      <div className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {value}<span className="text-[#1D9E75] text-2xl">{unit}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 leading-tight whitespace-pre-line">{label}</div>
                    </div>
                  ))}
                </div>

                <Separator className="my-8" />

                {/* Case study highlight */}
                <div className="flex items-center gap-4 bg-[#E1F5EE] rounded-xl p-5">
                  <div className="w-12 h-12 bg-[#1D9E75] rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-800 font-bold">+142% 門店預約率</div>
                    <div className="text-slate-500 text-sm">台北信義區牙醫診所 · 3 個月達標</div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Mini stats row */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                      50<span className="text-[#1D9E75] text-sm">+</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">服務品牌數</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                      NT$2M<span className="text-[#1D9E75] text-sm">+</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">協助客戶增收</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
