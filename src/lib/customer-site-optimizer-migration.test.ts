import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../../supabase/migrations/20260728_customer_site_optimizer_scans.sql', import.meta.url),
  'utf8',
).toLowerCase();

test('site optimizer history migration is server-only with RLS enabled', () => {
  assert.match(migration, /create table customer_site_optimizer_scans/);
  assert.match(migration, /alter table customer_site_optimizer_scans enable row level security/);
  assert.match(migration, /revoke all on table customer_site_optimizer_scans from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy/);
});
