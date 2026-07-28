# Customer growth outcome evidence

Track B `S3`: convert weekly task completion into an evidence-backed improvement
loop without Google OAuth or automatic publishing.

## Completion request

`PATCH /api/me/growth-cycle` remains bound to the current Auth.js customer
session. The request never accepts `customer_id`.

```json
{
  "cycleId": "00000000-0000-0000-0000-000000000000",
  "evidence": {
    "url": "https://example.com/published-result",
    "beforeValue": 10,
    "afterValue": 12,
    "count": 15,
    "confirmed": true,
    "note": "optional customer context"
  }
}
```

Only fields required by the task's deterministic verification plan are used.

## Evidence levels

| Method | Proves | Maximum confidence |
| --- | --- | --- |
| Confirmation | Customer says the action was completed | Low |
| Public URL | A page or post exists | Medium |
| Manual count | A quantified action was performed | Medium |
| Manual before/after | An observed metric changed | Medium |
| Future Track A server snapshots | Compatible scores changed across time | High |

Action evidence never automatically becomes a business-result claim. A published
URL can produce `action_verified`, but only comparable values can produce
`verified_improvement`, `verified_no_change`, or `verified_regression`.

## Stored fields

Migration: `20260727_customer_growth_outcomes.sql`.

- `baseline_snapshot`: store-profile context captured when the task is generated.
- `result_snapshot`: normalized values and a non-causal summary.
- `outcome_status`: action verified, improvement, no change, or regression.
- `confidence_level`: low, medium, or high.
- `next_recommendation`: continue, adjust, switch, or measure.

All fields live on the existing `customer_growth_cycles` row. No duplicate score
history table is introduced.

## Adaptive behavior

- Improvement may repeat the same general task direction once more.
- No change adjusts the channel, audience, or presentation.
- Regression switches direction and asks the customer to inspect execution or
  data quality.
- Action-only evidence asks for a downstream signal on the next cycle.

Structured summaries and recommendations may be sent to Groq for the next task.
Free-form completion notes, customer email, UUID, Stripe data, sessions, and
credentials are not sent to Groq.

## Customer evidence ledger

`/customer/week` aggregates the existing cycle history into a customer-facing
ledger. It shows completed weeks, weeks with structured evidence, observed
improvement weeks, the current completion streak, and the next verification
milestone.

Verification maturity progresses from an execution record to structured
evidence, one comparable before/after result, and finally multiple comparable
weeks. The level describes evidence quality only; it does not claim causation or
guarantee a business result.

## Audit

`growth_cycle.complete` stores only task type, outcome status, confidence, metric,
and numeric delta in `audit_log`. It does not store evidence URLs, notes, generated
content, email, or credentials.

## Acceptance gate

1. Apply PR #90 and #93 migrations first.
2. Apply `20260727_customer_growth_outcomes.sql`.
3. Generate one task for each verification method used by current templates.
4. Reject missing, malformed, credential-bearing, or non-HTTP(S) evidence URLs.
5. Confirm Customer A cannot read or update Customer B's cycle.
6. Confirm duplicate completion requests create one mutation and one audit event.
7. Confirm digest email contains the previous structured result but no raw note.
