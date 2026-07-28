import type { StoreProfile } from '@/lib/store-profile';
import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';

export type CustomerQuickstartStepId = 'profile' | 'first_task' | 'first_result' | 'second_result';

export interface CustomerQuickstartStep {
  id: CustomerQuickstartStepId;
  label: string;
  helper: string;
  completed: boolean;
}

export interface CustomerQuickstart {
  steps: CustomerQuickstartStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  nextStep: CustomerQuickstartStep | null;
}

export function buildCustomerQuickstart(
  profile: StoreProfile | null,
  cycles: CustomerGrowthCycle[],
): CustomerQuickstart {
  const completedWeeks = new Set(
    cycles
      .filter((cycle) => cycle.status === 'completed')
      .map((cycle) => cycle.week_start),
  ).size;
  const steps: CustomerQuickstartStep[] = [
    {
      id: 'profile',
      label: '讓系統認識你的店',
      helper: '確認店家、招牌服務與主要通路。',
      completed: Boolean(profile),
    },
    {
      id: 'first_task',
      label: '取得第一個本週任務',
      helper: '系統會挑一件 5–30 分鐘能完成的事。',
      completed: cycles.length > 0,
    },
    {
      id: 'first_result',
      label: '完成並留下第一筆紀錄',
      helper: '照著做完，再回來確認成果。',
      completed: completedWeeks >= 1,
    },
    {
      id: 'second_result',
      label: '再完成一週，開始比較',
      helper: '第二週後，系統會開始依結果調整方向。',
      completed: completedWeeks >= 2,
    },
  ];
  const completedCount = steps.filter((step) => step.completed).length;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    isComplete: completedCount === steps.length,
    nextStep: steps.find((step) => !step.completed) ?? null,
  };
}
