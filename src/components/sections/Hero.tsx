'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import HeroTryWidget from './HeroTryWidget';

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
  { value: '92', unit: '%', label: '搜尋者只看第一頁' },
  { value: '3', unit: '×', label: '地圖優化後詢問提升' },
  { value: '48', unit: 'h', label: '快速啟動' },
];

export default function Hero() {
  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white">
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

      {/* Drifting ambient blobs（速度優先：transform-only 動畫） */}
      <div
        className="hero-blob absolute -top-24 -left-20 h-72 w-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.14), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="hero-blob-2 absolute top-32 right-1/3 h-80 w-80 rounded-full pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.10), transparent 70%)' }}
        aria-hidden
      />

      {/* 雷達訊號脈衝 + 地圖圖釘（inline SVG 動畫，僅 lg+ 顯示；呼應「被 Google 地圖找到」） */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] hidden lg:block pointer-events-none"
        aria-hidden
      >
        <svg
          viewBox="0 0 520 520"
          className="h-[440px] w-[440px] xl:h-[520px] xl:w-[520px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 靜態導引圈 */}
          <circle cx="260" cy="260" r="130" stroke="#1D9E75" strokeOpacity="0.10" strokeWidth="1" />
          <circle cx="260" cy="260" r="190" stroke="#1D9E75" strokeOpacity="0.07" strokeWidth="1" />
          <circle cx="260" cy="260" r="250" stroke="#1D9E75" strokeOpacity="0.05" strokeWidth="1" />
          {/* 脈衝圈（基準 r=80，scale 0.34→1） */}
          <circle className="radar-ring" cx="260" cy="260" r="80" />
          <circle className="radar-ring" cx="260" cy="260" r="80" style={{ animationDelay: '1.4s' }} />
          <circle className="radar-ring" cx="260" cy="260" r="80" style={{ animationDelay: '2.8s' }} />
          {/* 中心圖釘 */}
          <g className="radar-pin">
            <circle cx="260" cy="262" r="36" fill="#1D9E75" fillOpacity="0.12" />
            <path
              d="M260 230c-13.8 0-25 11.2-25 25 0 17.5 25 41 25 41s25-23.5 25-41c0-13.8-11.2-25-25-25z"
              fill="#1D9E75"
            />
            <circle cx="260" cy="255" r="8.5" fill="#ffffff" />
          </g>
        </svg>
      </div>

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
                <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse motion-reduce:animate-none" />
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
            <motion.p variants={fadeUp} className="text-lg text-slate-500 leading-relaxed mb-5 max-w-lg">
              adlo 把要收費的在地行銷諮詢，做成 8 支免費工具。
              貼文、評論、健檢——3 秒自助產出，自己動手。
            </motion.p>

            {/* Tags */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-8">
              {['不用註冊', '不交出 Google 帳號', '結構化工具不是 AI 聊天', '台灣在地專用'].map((tag) => (
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
                <Link href="/tools">探索 8 支免費工具 →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold text-base border-slate-200 hover:border-[#1D9E75] hover:text-[#1D9E75]">
                <Link href="/my-week">我的這週素材</Link>
              </Button>
            </motion.div>

            {/* Stats strip */}
            <motion.div variants={fadeUp} className="mt-9 flex items-stretch gap-6">
              {stats.map(({ value, unit, label }, i) => (
                <div key={i} className={i !== 0 ? 'pl-6 border-l border-slate-100' : ''}>
                  <div className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {value}<span className="text-[#1D9E75] text-base">{unit}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-tight">{label}</div>
                </div>
              ))}
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} className="mt-6 flex items-center gap-3 text-slate-400 text-sm">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <span>專注台灣在地市場 · 檔案存本機不上傳</span>
            </motion.div>
          </div>

          {/* Right: 互動試一下 widget */}
          <motion.div variants={fadeIn}>
            <HeroTryWidget />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
