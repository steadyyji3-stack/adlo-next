import Link from 'next/link';
import { Check, Circle, Rocket, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CustomerQuickstart, CustomerQuickstartStepId } from '@/lib/customer-quickstart';
import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';

export function QuickstartGuide({
  quickstart,
  currentCycle,
}: {
  quickstart: CustomerQuickstart;
  currentCycle: CustomerGrowthCycle | null;
}) {
  if (quickstart.isComplete) {
    return (
      <details className="border-y border-emerald-200 bg-emerald-50/60 px-5 py-4 sm:px-6">
        <summary className="cursor-pointer list-none text-sm font-bold text-emerald-900">
          <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" aria-hidden />入門完成，系統已開始依每週結果調整</span>
        </summary>
        <p className="mt-2 max-w-2xl pl-6 text-sm leading-6 text-emerald-800">
          之後每週只要完成一件事並留下紀錄，成果頁會持續累積可比較的變化。
        </p>
      </details>
    );
  }

  const action = actionForStep(quickstart.nextStep?.id ?? 'profile', currentCycle);
  const progress = Math.round((quickstart.completedCount / quickstart.totalCount) * 100);

  return (
    <section className="border-y border-slate-200 bg-white px-5 py-6 sm:px-6" aria-labelledby="quickstart-title">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[#0F6E56]">
            <Rocket className="h-4 w-4" aria-hidden />
            <p className="text-xs font-extrabold">入門進度 {quickstart.completedCount} / {quickstart.totalCount}</p>
          </div>
          <h2 id="quickstart-title" className="mt-2 text-lg font-extrabold text-slate-950">先完成這四步，之後每週會更簡單</h2>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full rounded-full bg-[#1D9E75] transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2">
            {quickstart.steps.map((step, index) => (
              <li key={step.id} className="flex gap-3">
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${step.completed ? 'bg-[#1D9E75] text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step.completed ? <Check className="h-4 w-4" aria-hidden /> : <Circle className="h-3 w-3" aria-hidden />}
                </span>
                <div>
                  <p className={`text-sm font-bold ${step.completed ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>{index + 1}. {step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.helper}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="w-full border-t border-slate-200 pt-5 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-xs font-bold text-slate-500">現在做這一步</p>
          <p className="mt-2 text-sm font-extrabold leading-6 text-slate-950">{quickstart.nextStep?.label}</p>
          <Button asChild className="mt-4 w-full bg-[#1D9E75] font-bold text-white hover:bg-[#168060]">
            <Link href={action.href}><Target className="h-4 w-4" aria-hidden />{action.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function actionForStep(step: CustomerQuickstartStepId, currentCycle: CustomerGrowthCycle | null) {
  switch (step) {
    case 'profile':
      return { href: '/onboarding', label: '設定我的店家' };
    case 'first_task':
      return { href: '/customer/week?generate=1', label: '立即幫我準備' };
    case 'first_result':
      return { href: '/customer/week', label: '繼續第一次任務' };
    case 'second_result':
      return currentCycle?.status === 'completed'
        ? { href: '/customer/week', label: '查看第一次成果' }
        : { href: '/customer/week?generate=1', label: '開始本週任務' };
  }
}
