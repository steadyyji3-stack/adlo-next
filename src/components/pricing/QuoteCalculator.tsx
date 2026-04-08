'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Calculator } from 'lucide-react';

const services = [
  { id: 'gbp',     label: 'Google 商家優化',       desc: '地圖排名、評論管理、商家貼文', price: 4800 },
  { id: 'seo',     label: '在地 SEO 佈局',           desc: '關鍵字研究、網頁優化、排名追蹤', price: 6800 },
  { id: 'content', label: '內容行銷 × 廣告文案',     desc: 'SEO 文章、社群貼文、廣告文案', price: 4500 },
  { id: 'google',  label: 'Google Ads 代管',         desc: '月費 NT$5,000 起，或廣告預算 15%（取高者）', price: 5000 },
  { id: 'meta',    label: 'Meta 廣告代管',            desc: '月費 NT$5,000 起，或廣告預算 15%（取高者）', price: 5000 },
  { id: 'report',  label: '月度策略報告 + 視訊會議', desc: '數據解析、競爭分析、月度策略討論', price: 2500 },
];

const discounts: Record<number, number> = {
  1: 0,
  2: 5,
  3: 8,
  4: 10,
  5: 12,
  6: 15,
};

export default function QuoteCalculator() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const subtotal = selected.reduce((acc, id) => {
    const svc = services.find((s) => s.id === id);
    return acc + (svc?.price ?? 0);
  }, 0);

  const count = selected.length;
  const discountPct = discounts[Math.min(count, 6)] ?? 0;
  const discountAmt = Math.round(subtotal * discountPct / 100);
  const total = subtotal - discountAmt;

  const queryStr = selected.length
    ? `?services=${selected.join(',')}`
    : '';

  return (
    <Card className="border-slate-100 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

          {/* Left: Services */}
          <div className="p-8">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#1D9E75]" />
              選擇服務項目
            </h3>
            <p className="text-xs text-slate-400 mb-6">選越多項目享越高折扣</p>
            <div className="space-y-4">
              {services.map((svc) => {
                const checked = selected.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggle(svc.id)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                      checked
                        ? 'border-[#1D9E75] bg-[#E1F5EE]'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(svc.id)}
                      className="mt-0.5 data-[state=checked]:bg-[#1D9E75] data-[state=checked]:border-[#1D9E75]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-slate-700 cursor-pointer text-sm">
                          {svc.label}
                        </Label>
                        <span className="text-xs font-bold text-slate-500">
                          NT${svc.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{svc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Quote Summary */}
          <div className="p-8 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-6">估價明細</h3>

            {selected.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm">請在左側選擇服務項目<br />立即試算你的月費估價</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Line items */}
                <div className="space-y-3 flex-1">
                  {selected.map((id) => {
                    const svc = services.find((s) => s.id === id)!;
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{svc.label}</span>
                        <span className="text-slate-700 font-medium">NT${svc.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-5" />

                {/* Subtotal */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>小計</span>
                    <span>NT${subtotal.toLocaleString()}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-[#1D9E75] font-medium">
                      <span>組合折扣（{discountPct}% off）</span>
                      <span>- NT${discountAmt.toLocaleString()}</span>
                    </div>
                  )}
                  {count >= 2 && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>已選 {count} 項服務</span>
                      <span>再加 1 項省更多</span>
                    </div>
                  )}
                </div>

                <Separator className="my-5" />

                {/* Total */}
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">估算月費</p>
                    <div className="flex items-end gap-1">
                      <span className="text-slate-400 text-sm">NT$</span>
                      <span className="text-3xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                        {total.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-sm mb-0.5">/月</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">年繳再享 85 折</p>
                  </div>
                  {discountPct > 0 && (
                    <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-0 text-xs">
                      省 NT${discountAmt.toLocaleString()}/月
                    </Badge>
                  )}
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full cta-gradient text-white font-bold hover:opacity-90 shadow-lg shadow-green-900/20"
                >
                  <Link href={`/contact${queryStr}`}>
                    索取此組合報價單 <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <p className="text-xs text-slate-400 text-center mt-3">
                  填寫問卷後 1–2 工作天內寄出報價單，確認後以匯款付款
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
