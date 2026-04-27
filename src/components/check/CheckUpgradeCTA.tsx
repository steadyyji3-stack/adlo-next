import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, ShieldCheck, Coins } from 'lucide-react';

export default function CheckUpgradeCTA() {
  return (
    <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-white via-emerald-50/30 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <Badge
          variant="outline"
          className="mb-5 text-[#0F6E56] border-[#1D9E75]/30 bg-[#E1F5EE] tracking-widest text-xs font-bold uppercase"
        >
          R-01 診斷包
        </Badge>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-tight">
          想知道這些分數
          <br className="md:hidden" />
          怎麼來、怎麼修？
        </h2>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          R-01 完整健檢報告 + 30 天優化指引。
          <br className="hidden md:block" />
          顧問實際操刀你的商家，告訴你每一分要補哪裡。
        </p>

        <div className="flex items-baseline justify-center gap-3 mb-2">
          <span className="text-5xl md:text-6xl font-bold text-slate-900">NT$1,990</span>
        </div>
        <p className="text-sm text-slate-500 mb-10">
          30 天內升級訂閱，整額折抵
        </p>

        <Button
          asChild
          size="lg"
          className="h-14 px-10 bg-[#1D9E75] hover:bg-[#168060] text-white font-semibold text-base gap-2 focus-visible:ring-emerald-500"
        >
          <Link
            href="/diagnostic"
            data-gtm-event="diagnostic_cta_click"
            data-gtm-cta-location="check_upgrade_cta"
          >
            看完整報告
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
          <li className="inline-flex items-center gap-2">
            <Clock className="size-4 text-emerald-600" aria-hidden /> 48 小時內交付
          </li>
          <li className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" aria-hidden /> 30 天不滿意全額退
          </li>
          <li className="inline-flex items-center gap-2">
            <Coins className="size-4 text-emerald-600" aria-hidden /> 升級訂閱折抵 1,990
          </li>
        </ul>
      </div>
    </section>
  );
}
