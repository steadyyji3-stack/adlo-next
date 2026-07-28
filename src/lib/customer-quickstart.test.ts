import assert from 'node:assert/strict';
import test from 'node:test';
import type { StoreProfile } from '@/lib/store-profile';
import type { CustomerGrowthCycle } from '@/lib/customer-growth-types';
import { buildCustomerQuickstart } from './customer-quickstart';

const profile = { storeName: '測試店家' } as StoreProfile;

function cycle(week: string, status: CustomerGrowthCycle['status']): CustomerGrowthCycle {
  return { week_start: week, status } as CustomerGrowthCycle;
}

test('starts with the store profile step', () => {
  const quickstart = buildCustomerQuickstart(null, []);
  assert.equal(quickstart.completedCount, 0);
  assert.equal(quickstart.nextStep?.id, 'profile');
});

test('moves to the first task after a profile is saved', () => {
  const quickstart = buildCustomerQuickstart(profile, []);
  assert.equal(quickstart.completedCount, 1);
  assert.equal(quickstart.nextStep?.id, 'first_task');
});

test('requires two distinct completed weeks before quickstart is complete', () => {
  const firstWeek = buildCustomerQuickstart(profile, [cycle('2026-07-27', 'completed')]);
  assert.equal(firstWeek.completedCount, 3);
  assert.equal(firstWeek.nextStep?.id, 'second_result');

  const secondWeek = buildCustomerQuickstart(profile, [
    cycle('2026-07-27', 'completed'),
    cycle('2026-07-20', 'completed'),
  ]);
  assert.equal(secondWeek.isComplete, true);
  assert.equal(secondWeek.nextStep, null);
});

test('does not count regenerated tasks in the same week twice', () => {
  const quickstart = buildCustomerQuickstart(profile, [
    cycle('2026-07-27', 'completed'),
    cycle('2026-07-27', 'completed'),
  ]);
  assert.equal(quickstart.nextStep?.id, 'second_result');
});
