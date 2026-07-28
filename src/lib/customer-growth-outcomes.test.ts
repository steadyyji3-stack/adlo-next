import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateGrowthOutcome,
  verificationPlanForTask,
  withVerificationPlan,
} from './customer-growth-outcomes';
import type { GrowthTask } from './customer-growth-types';

const reviewTask: GrowthTask = {
  type: 'review_request',
  title: '邀請近期客人留下真實評論',
  objective: '累積具體且真實的顧客體驗。',
  whyNow: '服務完成後一週內，客人對細節仍有印象。',
  scoreDimension: 'reviews',
  estimatedMinutes: 10,
  steps: ['挑選近期客人', '一對一傳送邀請'],
  deliverables: [{ label: '邀請訊息', content: '請留下真實感受，不需要指定星等。', usage: '一對一傳送' }],
  successCheck: '已向真實客人發出邀請，且沒有要求五星。',
};

test('review task uses before/after verification', () => {
  const plan = verificationPlanForTask(reviewTask);
  assert.equal(plan.metric, 'review_count');
  assert.equal(plan.method, 'before_after');
});

test('task type overrides an injected verification plan', () => {
  const normalized = withVerificationPlan({
    ...reviewTask,
    verification: {
      metric: 'published_asset',
      method: 'confirmation',
      direction: 'completion',
      label: 'untrusted',
      prompt: 'untrusted',
    },
  });
  assert.equal(normalized.verification?.metric, 'review_count');
  assert.equal(normalized.verification?.method, 'before_after');
});

test('positive count delta is an observed improvement without causal claim', () => {
  const result = evaluateGrowthOutcome(reviewTask, { beforeValue: 10, afterValue: 12 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, 'verified_improvement');
  assert.equal(result.confidence, 'medium');
  assert.equal(result.result.delta, 2);
  assert.equal(result.recommendation.strategy, 'continue');
  assert.match(result.result.summary, /不代表單一因果/);
});

test('unchanged metric recommends adjustment', () => {
  const result = evaluateGrowthOutcome(reviewTask, { beforeValue: 10, afterValue: 10 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, 'verified_no_change');
  assert.equal(result.recommendation.strategy, 'adjust');
});

test('negative metric direction recommends switching', () => {
  const result = evaluateGrowthOutcome(reviewTask, { beforeValue: 10, afterValue: 9 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, 'verified_regression');
  assert.equal(result.recommendation.strategy, 'switch');
});

test('published task requires a safe public URL and verifies action only', () => {
  const publishedTask = withVerificationPlan({ ...reviewTask, type: 'gbp_post', scoreDimension: 'content' });
  const invalid = evaluateGrowthOutcome(publishedTask, { url: 'javascript:alert(1)' });
  assert.equal(invalid.ok, false);
  assert.equal(evaluateGrowthOutcome(publishedTask, { url: 'https://user:pass@example.com/post' }).ok, false);

  const valid = evaluateGrowthOutcome(publishedTask, { url: 'https://example.com/post/1' });
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  assert.equal(valid.status, 'action_verified');
  assert.equal(valid.confidence, 'medium');
  assert.equal(valid.result.delta, null);
});

test('lower local rank is treated as improvement when direction decreases', () => {
  const rankTask: GrowthTask = {
    ...reviewTask,
    scoreDimension: 'keywords',
    verification: {
      metric: 'local_rank',
      method: 'before_after',
      direction: 'decrease',
      label: '在地排名',
      prompt: '填入前後排名',
      unit: '名',
    },
  };
  const result = evaluateGrowthOutcome(rankTask, { beforeValue: 10, afterValue: 8 });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, 'verified_improvement');
  assert.equal(result.result.delta, -2);
});

test('broadcast count must prove at least one actual send', () => {
  const broadcastTask = withVerificationPlan({ ...reviewTask, type: 'line_broadcast', scoreDimension: 'content' });
  assert.equal(evaluateGrowthOutcome(broadcastTask, { count: 0 }).ok, false);
  assert.equal(evaluateGrowthOutcome(broadcastTask, { count: 15 }).ok, true);
});
