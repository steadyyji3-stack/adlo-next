'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, X, FileText } from 'lucide-react';

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
  return (
    <>
      {/* 目前狀態說明 */}
      <div className="flex items-center justify-center gap-3 mb-10 bg-amber-50 border border-amber-200 rounded-xl px-6 py-3 max-w-xl mx-auto">
        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 text-center">
          目前以<strong>問卷詢問 + 匯款</strong>方式承接業務，詳細報價請填寫下方表單。
        </p>
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

              {/* 價格區：改為「依需求報價」 */}
              <div className="mt-6">
                <p className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>
                  依需求報價
                </p>
                <p className="text-xs text-slate-400 mt-1">填寫表單後 1–2 工作天內提供報價單</p>
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
                <Link href={`/contact?plan=${plan.id}`}>
                  索取報價單
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
