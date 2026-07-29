import assert from 'node:assert/strict';
import test from 'node:test';
import type { StoreProfile } from '@/lib/store-profile';
import { buildCustomerInstantDeliverable } from './customer-instant-value';

const profile: StoreProfile = {
  storeName: '安心理髮店',
  industry: '美髮美容',
  selectedTags: ['剪髮'],
  savedAt: '2026-07-28T00:00:00.000Z',
};

test('builds a ready-to-send review request from customer data', () => {
  const deliverable = buildCustomerInstantDeliverable({
    profile,
    city: '台北市',
    signatureItems: ['男士剪髮'],
    reviewUrl: 'https://g.page/r/test-store/review',
  });

  assert.equal(deliverable.label, '第一份完成品');
  assert.match(deliverable.content, /安心理髮店/);
  assert.match(deliverable.content, /男士剪髮/);
  assert.match(deliverable.content, /台北市/);
  assert.match(deliverable.content, /https:\/\/g\.page\/r\/test-store\/review/);
  assert.doesNotMatch(deliverable.content, /五星|好評換/);
});

test('falls back safely when optional customer fields are missing', () => {
  const deliverable = buildCustomerInstantDeliverable({ profile });

  assert.match(deliverable.content, /剪髮/);
  assert.match(deliverable.content, /Google 地圖搜尋「安心理髮店」/);
  assert.doesNotMatch(deliverable.content, /貼上|請填入/);
  assert.ok(!deliverable.content.includes('undefined'));
  assert.ok(!deliverable.content.includes('null'));
});

test('uses the industry when tags and signature items are empty', () => {
  const deliverable = buildCustomerInstantDeliverable({
    profile: { ...profile, selectedTags: [] },
    signatureItems: ['  '],
  });

  assert.match(deliverable.content, /美髮美容服務/);
});

test('keeps a Google Maps page usable without calling it a direct review link', () => {
  const deliverable = buildCustomerInstantDeliverable({
    profile,
    reviewUrl: 'https://maps.google.com/maps?cid=123',
  });

  assert.match(deliverable.content, /點「評論」即可分享/);
  assert.match(deliverable.content, /cid=123/);
  assert.doesNotMatch(deliverable.content, /貼上|請填入/);
});

test('does not place an unknown destination into customer-facing copy', () => {
  const deliverable = buildCustomerInstantDeliverable({
    profile,
    reviewUrl: 'https://example.com/not-a-review-page',
  });

  assert.doesNotMatch(deliverable.content, /example\.com/);
  assert.match(deliverable.content, /Google 地圖搜尋「安心理髮店」/);
});
