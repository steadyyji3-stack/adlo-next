import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../../supabase/migrations/20260723_customer_review_drafts.sql', import.meta.url),
  'utf8',
).toLowerCase();

test('review draft migration keeps customer data behind server-only RLS access', () => {
  assert.match(migration, /create table if not exists customer_review_drafts/);
  assert.match(migration, /alter table customer_review_drafts enable row level security/);
  assert.match(migration, /revoke all on table customer_review_drafts from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy/);
});
