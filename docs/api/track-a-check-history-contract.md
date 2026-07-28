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

## Acceptance

- Customer A cannot request Customer B's `storeProfileKey` history.
- Reconnecting a profile requires the current Auth.js session.
- Track A deletion or consent withdrawal makes Track B stop consuming future
  snapshots while preserving already-issued audit records required for service
  history.
- No Google OAuth credential crosses this boundary.
