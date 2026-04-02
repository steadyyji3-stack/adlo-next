'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, X } from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  nameEn: string;
  monthlyPrice: number;
  desc: string;
  highlight: boolean;
  badge: string | null;
  features: { text: string; included: boolean }[];
  cta: string;
  ctaHref: string;
};

export default function PricingToggle({ plans }: { plans: Plan[] }) {
  const [isAnnual, setIsAnnual] = useState(false);

  function displayPrice(monthly: number) {
    const price = isAnnual ? Math.round(monthly * 0.85) : monthly;
    return price.toLocaleString('zh-TW');
  }

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <Label className={`text-sm font-medium ${!isAnnual ? 'text-slate-800' : 'text-slate-400'}`}>月繳</Label>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-[#1D9E75]"
        />
        <Label className={`text-sm font-medium ${isAnnual ? 'text-slate-800' : 'text-slate-400'}`}>
          年繳
          <span className="ml-2 inline-flex items-center bg-[#E1F5EE] text-[#0F6E56] text-xs font-bold px-2 py-0.5 rounded-full">
            省 15%
          </span>
        </Label>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col transition-all duration-200 ${
              plan.highlight
                ? 'border-2 border-[#1D9E75] shadow-xl shadow-green-900/10 scale-[1.02]'
                : 'border-slate-100 shadow-sm hover:shadow-md'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#1D9E75] text-white border-0 px-4 py-1 text-xs font-bold shadow-sm">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="p-8 pb-4">
              <div className="mb-1">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">{plan.nameEn}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                {plan.name}
              </h3>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">{plan.desc}</p>

              <div className="mt-6">
                <div className="flex items-end gap-1">
                  <span className="text-slate-400 text-sm mb-1">NT$</span>
                  <span className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                    {displayPrice(plan.monthlyPrice)}
                  </span>
                  <span className="text-slate-400 text-sm mb-1">/月</span>
                </div>
                {isAnnual && (
                  <p className="text-xs text-slate-400 mt-1">
                    原價 NT${plan.monthlyPrice.toLocaleString('zh-TW')}，年繳省{' '}
                    <span className="text-[#1D9E75] font-bold">
                      NT${(plan.monthlyPrice * 0.15 * 12).toLocaleString('zh-TW')}
                    </span>
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-4 flex flex-col flex-1">
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.included
                      ? <CheckCircle className="w-4 h-4 text-[#1D9E75] flex-shrink-0" />
                      : <X className="w-4 h-4 text-slate-200 flex-shrink-0" />
                    }
                    <span className={f.included ? 'text-slate-600' : 'text-slate-300'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className={`w-full mt-8 font-bold ${
                  plan.highlight
                    ? 'cta-gradient text-white hover:opacity-90 shadow-lg shadow-green-900/20'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                <Link href={`${plan.ctaHref}${isAnnual ? '&billing=annual' : ''}`}>
                  {plan.cta}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
