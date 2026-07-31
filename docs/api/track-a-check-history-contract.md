# Track A `/check` history contract for Track B

Owner: Track A. Consumer: Track B customer dashboard and weekly outcome engine.

This document defines the future read-only boundary. Track B must not create a
second `/check` score table or read browser `localStorage` on the server.

## Required Track A record

```ts
interface CheckHistorySnapshot {
  storeProfileKey: string;
  checkedAt: string;
  overallScore: number;
  dimensions: {
    profile: number | null;
    reviews: number | null;
    reply: number | null;
    photos: number | null;
    keywords: number | null;
    local: number | null;
    content: number | null;
  };
  sourceVersion: string;
}
```

## Identity handoff

1. Track A creates an opaque `storeProfileKey` when its server-side history is
   available.
2. During paid onboarding, the customer explicitly selects or confirms the Track
   A store profile to connect.
3. Track B stores only that opaque key in the paid store profile. It does not
   match customers by raw email, URL text, or store name.
4. Every Track B read remains session-bound to the current customer.

## Consumer behavior

- Track B reads snapshots; it never edits or re-scores Track A history.
- A weekly task may copy the latest relevant score into
  `baseline_snapshot`, including `checkedAt` and `sourceVersion`.
- Completion compares only compatible `sourceVersion` values.
- Missing or stale history produces a manual verification plan; it must not
  invent a score.
- Customer-entered URLs and before/after values have at most `medium` confidence.
  `high` confidence is reserved for compatible server snapshots supplied by the
  Track A contract.
- A score delta is an observed before/after change, not proof that one task caused
  the change.

## Track A implementation (added 2026-07-29)

Source: `src/lib/check-snapshots.ts`, `supabase/migrations/20260729_check_snapshots.sql`.

### Storage

| Table | Purpose |
| --- | --- |
| `check_store_profiles` | Opaque identity. `store_profile_key uuid` is **random**, not derived from the store name, so it cannot be reversed or guessed. Unique on `(normalized_name, normalized_location)` so a returning store resolves to the same key. |
| `check_snapshots` | One row per accepted check. Indexed `(store_profile_key, checked_at desc)`. |

Both tables `enable row level security`, carry **no policies**, and explicitly
`revoke all ... from anon, authenticated`. RLS alone is not sufficient — table
privileges must be revoked as well, or the Data API can still read the rows.
Verification queries are inline in the migration.

### Exported interface

```ts
import {
  resolveStoreProfileKey,   // (storeName, location) => Promise<string>
  recordCheckSnapshot,      // write, deduplicated (see below)
  listCheckSnapshots,       // (storeProfileKey, limit = 24) => newest first
  getLatestCheckSnapshot,   // (storeProfileKey) => latest | null
  CHECK_SOURCE_VERSION,     // 'check-v1'
  type CheckHistorySnapshot,
  type CheckSnapshotDimensions,
} from '@/lib/check-snapshots';
```

`listCheckSnapshots` and `getLatestCheckSnapshot` perform **no session
validation** — they do not know who is calling. Track B must guarantee the key
belongs to the current session's customer before calling them.

### Write path

`/api/check` schedules the write with `after()` from `next/server`, so it runs
**after the response is sent**. This keeps the free check fast and, unlike a
floating promise, is not cut off by the serverless runtime. Any failure is logged
and swallowed — the check response is never affected (fail-open).

### Deduplication

A write is skipped when the same store already has a snapshot within
**6 hours** carrying the same `overallScore` **and** the same `sourceVersion`.
A changed score always writes — change is the point of the table.
`recordCheckSnapshot` returns `{ written: false, reason: 'duplicate' }` in that
case; it is not an error.

### Dimensions

`/check` currently produces six dimensions (`profile`, `reviews`, `reply`,
`photos`, `keywords`, `local`). The contract's seventh, `content`, is **written
as `null`** rather than fabricated. Track B must treat `null` as "not measured",
not as zero.

### Retention

No automatic expiry yet. Rows are small (one row per accepted check, capped by
the 6-hour dedup window and by the existing `/check` rate limits). Revisit if
volume grows; deleting a `check_store_profiles` row cascades to its snapshots.

## Acceptance

- Customer A cannot request Customer B's `storeProfileKey` history.
- Reconnecting a profile requires the current Auth.js session.
- Track A deletion or consent withdrawal makes Track B stop consuming future
  snapshots while preserving already-issued audit records required for service
  history.
- No Google OAuth credential crosses this boundary.
