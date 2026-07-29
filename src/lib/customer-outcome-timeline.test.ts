import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCustomerOutcomeTimeline } from './customer-outcome-timeline';

test('combines customer outcomes in newest-first order', () => {
  const items = buildCustomerOutcomeTimeline({
    growthCycles: [{
      id: 'growth-1',
      status: 'completed',
      task: { title: '補上服務頁說明' },
      outcome_status: 'verified_improvement',
      result_snapshot: { summary: '分數從 60 變成 68，觀察到增加。' },
      completed_at: '2026-07-28T03:00:00.000Z',
      updated_at: '2026-07-28T03:00:00.000Z',
    }],
    siteScans: [{
      id: 'scan-1', hostname: 'example.tw', overall_score: 72, page_count: 5,
      scanned_at: '2026-07-29T03:00:00.000Z',
    }],
    reviewDrafts: [{
      id: 'review-1', reviewer_name: '王小姐', rating: 5, status: 'copied',
      generated_at: '2026-07-27T03:00:00.000Z', updated_at: '2026-07-27T04:00:00.000Z',
    }],
    reports: [],
  });

  assert.deepEqual(items.map((item) => item.kind), ['site_scan', 'growth', 'review_draft']);
  assert.equal(items[0].statusLabel, '建立基準');
  assert.equal(items[1].statusLabel, '觀察到改善');
  assert.equal(items[2].statusLabel, '可發布成品');
});

test('compares site scores only with the previous scan of the same hostname', () => {
  const items = buildCustomerOutcomeTimeline({
    growthCycles: [],
    siteScans: [
      { id: 'a-new', hostname: 'a.tw', overall_score: 78, page_count: 6, scanned_at: '2026-07-29T00:00:00.000Z' },
      { id: 'b-new', hostname: 'b.tw', overall_score: 50, page_count: 4, scanned_at: '2026-07-28T00:00:00.000Z' },
      { id: 'a-old', hostname: 'a.tw', overall_score: 70, page_count: 5, scanned_at: '2026-07-27T00:00:00.000Z' },
    ],
    reviewDrafts: [],
    reports: [],
  });

  const latestA = items.find((item) => item.id === 'site:a-new');
  const latestB = items.find((item) => item.id === 'site:b-new');
  assert.equal(latestA?.statusLabel, '分數增加');
  assert.match(latestA?.summary ?? '', /增加 8 分/);
  assert.equal(latestB?.statusLabel, '建立基準');
  assert.doesNotMatch(latestA?.summary ?? '', /造成|因此|帶來/);
});

test('omits unfinished cycles and applies the requested limit', () => {
  const items = buildCustomerOutcomeTimeline({
    growthCycles: [{
      id: 'ready-1', status: 'ready', task: { title: '尚未完成' },
      completed_at: null, updated_at: '2026-07-29T00:00:00.000Z',
    }],
    siteScans: [],
    reviewDrafts: [
      { id: 'one', reviewer_name: null, rating: 4, status: 'draft', generated_at: '2026-07-28T00:00:00.000Z', updated_at: '2026-07-28T00:00:00.000Z' },
      { id: 'two', reviewer_name: null, rating: 3, status: 'draft', generated_at: '2026-07-27T00:00:00.000Z', updated_at: '2026-07-27T00:00:00.000Z' },
    ],
    reports: [],
    limit: 1,
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'review:one');
});
