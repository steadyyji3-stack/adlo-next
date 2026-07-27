import type {
  CustomerGrowthCycle,
  GrowthNextRecommendation,
} from '@/lib/customer-growth-types';

export type GrowthVerificationStage =
  | 'starting'
  | 'recorded'
  | 'verified'
  | 'comparable'
  | 'repeatable';

export interface CustomerGrowthProgress {
  completedWeeks: number;
  verifiedWeeks: number;
  improvementWeeks: number;
  comparisonWeeks: number;
  completionStreak: number;
  stage: GrowthVerificationStage;
  stageLabel: string;
  nextMilestone: string;
  latestRecommendation: GrowthNextRecommendation | null;
}

const STAGE_LABELS: Record<GrowthVerificationStage, string> = {
  starting: '準備第一週',
  recorded: '已有執行紀錄',
  verified: '動作已有證據',
  comparable: '已有前後比較',
  repeatable: '累積多週比較',
};

export function buildCustomerGrowthProgress(cycles: CustomerGrowthCycle[]): CustomerGrowthProgress {
  const completed = cycles
    .filter((cycle) => cycle.status === 'completed')
    .sort((a, b) => b.week_start.localeCompare(a.week_start));
  const verifiedWeeks = completed.filter((cycle) => Boolean(cycle.outcome_status)).length;
  const comparisonWeeks = completed.filter((cycle) =>
    cycle.outcome_status === 'verified_improvement'
    || cycle.outcome_status === 'verified_no_change'
    || cycle.outcome_status === 'verified_regression').length;
  const improvementWeeks = completed.filter((cycle) =>
    cycle.outcome_status === 'verified_improvement').length;
  const stage = verificationStage({
    completedWeeks: completed.length,
    verifiedWeeks,
    comparisonWeeks,
  });

  return {
    completedWeeks: completed.length,
    verifiedWeeks,
    improvementWeeks,
    comparisonWeeks,
    completionStreak: completedWeekStreak(completed),
    stage,
    stageLabel: STAGE_LABELS[stage],
    nextMilestone: nextVerificationMilestone(stage),
    latestRecommendation: completed.find((cycle) => cycle.next_recommendation)?.next_recommendation ?? null,
  };
}

function verificationStage(input: {
  completedWeeks: number;
  verifiedWeeks: number;
  comparisonWeeks: number;
}): GrowthVerificationStage {
  if (input.comparisonWeeks >= 2) return 'repeatable';
  if (input.comparisonWeeks >= 1) return 'comparable';
  if (input.verifiedWeeks >= 1) return 'verified';
  if (input.completedWeeks >= 1) return 'recorded';
  return 'starting';
}

function nextVerificationMilestone(stage: GrowthVerificationStage) {
  switch (stage) {
    case 'starting':
      return '先完成一件本週任務，留下第一筆執行紀錄。';
    case 'recorded':
      return '下次提交公開網址、實際數量或前後數值，讓完成紀錄可以驗收。';
    case 'verified':
      return '下一週改用前後數值，比較動作前後是否真的有變化。';
    case 'comparable':
      return '再累積一週可比較結果，確認這個方向能否重現。';
    case 'repeatable':
      return '持續追蹤同一指標；系統會依每週結果延續、調整或換方向。';
  }
}

function completedWeekStreak(completed: CustomerGrowthCycle[]) {
  const distinctWeeks = [...new Set(completed.map((cycle) => cycle.week_start))]
    .sort((a, b) => b.localeCompare(a));
  if (distinctWeeks.length === 0) return 0;

  let streak = 1;
  for (let index = 1; index < distinctWeeks.length; index += 1) {
    if (daysBetween(distinctWeeks[index - 1], distinctWeeks[index]) !== 7) break;
    streak += 1;
  }
  return streak;
}

function daysBetween(later: string, earlier: string) {
  const laterTime = Date.parse(`${later}T00:00:00Z`);
  const earlierTime = Date.parse(`${earlier}T00:00:00Z`);
  return Math.round((laterTime - earlierTime) / 86_400_000);
}
