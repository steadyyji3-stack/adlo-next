import { Badge } from '@/components/ui/badge';

export default function SubscribeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-5">
          開台 Waitlist · 60 天後正式上線
        </Badge>
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-5 leading-[1.15]"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          不賣工時，只賣結果——
          <br className="hidden sm:block" />
          <span className="text-[#1D9E75]">三個產品化月訂閱</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          和市面上「小時計費的行銷公司」不一樣，adlo 把服務拆成三個固定產品。
          <br className="hidden sm:block" />
          你知道每月付多少、拿到什麼、數字長什麼樣。
        </p>
        <p className="text-sm text-slate-500 mt-6">
          現在登記 Waitlist，開台第一個月
          <span className="font-bold text-slate-900 mx-1">6 折</span>
          且鎖定續訂原價不調漲。
        </p>
      </div>
    </section>
  );
}
