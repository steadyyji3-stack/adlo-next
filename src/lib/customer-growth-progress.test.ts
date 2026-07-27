import assert from 'node:assert/strict';
import test from 'node:test';
import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';
import { buildCustomerGrowthProgress } from '@/lib/customer-growth-progress';

test('starts with a concrete first milestone when there is no history', () => {
  const progress = buildCustomerGrowthProgress([]);

  assert.equal(progress.stage, 'starting');
  assert.equal(progress.completedWeeks, 0);
  assert.equal(progress.completionStreak, 0);
  assert.match(progress.nextMilestone, /第一筆執行紀錄/);
});

test('separates action evidence from comparable before-after evidence', () => {
  const progress = buildCustomerGrowthProgress([
    cycle('2026-07-21', 'action_verified'),
    cycle('2026-07-14', null),
  ]);

  assert.equal(progress.stage, 'verified');
  assert.equal(progress.completedWeeks, 2);
  assert.equal(progress.verifiedWeeks, 1);
  assert.equal(progress.comparisonWeeks, 0);
  assert.equal(progress.completionStreak, 2);
});

test('promotes to repeatable only after two comparable weeks', () => {
  const latest = cycle('2026-07-21', 'verified_no_change', {
    strategy: 'adjust',
    rationale: '調整訊息後再測一次。',
    preferredDimension: 'reviews',
  });
  const progress = buildCustomerGrowthProgress([
    cycle('2026-07-07', 'action_verified'),
    cycle('2026-07-14', 'verified_improvement'),
    latest,
  ]);

  assert.equal(progress.stage, 'repeatable');
  assert.equal(progress.comparisonWeeks, 2);
  assert.equal(progress.improvementWeeks, 1);
  assert.equal(progress.completionStreak, 3);
  assert.equal(progress.latestRecommendation?.strategy, 'adjust');
});

test('streak stops at the first missing completed week', () => {
  const progress = buildCustomerGrowthProgress([
    cycle('2026-07-21', 'verified_improvement'),
    cycle('2026-07-07', 'verified_improvement'),
    cycle('2026-06-30', 'verified_improvement'),
  ]);

  assert.equal(progress.completionStreak, 1);
});

function cycle(
  weekStart: string,
  outcomeStatus: CustomerGrowthCycle['outcome_status'],
  recommendation: CustomerGrowthCycle['next_recommendation'] = null,
): CustomerGrowthCycle {
  return {
    id: `${weekStart}-0000-4000-8000-000000000000`,
    customer_id: 'customer-1',
    week_start: weekStart,
    status: 'completed',
    task: {
      type: 'review_request',
      title: '邀請近期滿意客人留下評論',
      objective: '累積真實評論，增加新客人的信任。',
      whyNow: '近期已有完成服務的客人，適合現在邀請。',
      scoreDimension: 'reviews',
      estimatedMinutes: 15,
      steps: ['整理名單', '送出邀請'],
      deliverables: [{ label: '邀請文字', content: '謝謝你的支持，歡迎留下真實評論。', usage: '傳給近期客人' }],
      successCheck: '確認邀請已送出並記錄評論數。',
    },
    evidence: [],
    profile_snapshot: {
      storeName: '測試店家',
      industry: '餐飲',
      selectedTags: [],
      channels: [],
      savedAt: `${weekStart}T00:00:00.000Z`,
    },
    generation_source: 'template',
    generation_count: 1,
    instruction: null,
    feedback: null,
    outcome_status: outcomeStatus,
    confidence_level: outcomeStatus ? 'medium' : null,
    next_recommendation: recommendation,
    completed_at: `${weekStart}T04:00:00.000Z`,
    created_at: `${weekStart}T01:00:00.000Z`,
    updated_at: `${weekStart}T04:00:00.000Z`,
  };
}
