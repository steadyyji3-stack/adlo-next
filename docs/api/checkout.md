# Checkout API

Track B1 subscription checkout for the paid self-serve flow.

## `POST /api/checkout`

Creates a Stripe Checkout Session in subscription mode.

Request:

```json
{
  "planId": "growth",
  "billing": "monthly",
  "customerEmail": "owner@example.com",
  "customerName": "Owner"
}
```

## First Month Free

All subscription Checkout Sessions include:

- `subscription_data.trial_period_days = 30`
- metadata `offer = first_month_free`
- metadata `trialDays = 30`

Stripe remains the source of truth for trial status. The webhook stores `trial_end` from the retrieved Stripe subscription.

## Redirect URLs

When `NEXT_PUBLIC_SITE_URL` is configured, Checkout success and cancel URLs use that canonical site URL instead of trusting the request `Origin` header.

## No Outcome Refund Logic

This endpoint does not implement score-based refunds, ranking guarantees, or "results guarantee" billing logic. The commercial offer is subscription-based:

- first month free
- cancel anytime through Stripe Customer Portal
- Stripe webhook syncs subscription lifecycle

## Safety

- Does not log payment method data.
- Does not store Checkout URLs in `audit_log`.
- Does not request OAuth or Google account permissions.
