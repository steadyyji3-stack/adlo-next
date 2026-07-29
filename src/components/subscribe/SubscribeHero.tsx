import { Badge } from '@/components/ui/badge';

export default function SubscribeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-5">
          30 天免費試用 · 隨時取消
        </Badge>
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.15]"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          每週完成一件
          <br className="hidden sm:block" />
          <span className="text-[#1D9E75]">最值得做的店家成長任務</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          不用交出 Google 帳號，也不用先學 SEO。
          <br className="hidden sm:block" />
          設定好店家，adlo 每週準備一個清楚的任務；你完成並留下結果，系統再依觀察調整下一步。
        </p>
        <p className="text-sm text-slate-500 mt-6">
          前 30 天不收費，之後才開始計價。
          <span className="mx-1">·</span>
          隨時可從會員中心自己取消。
        </p>
      </div>
    </section>
  );
}
