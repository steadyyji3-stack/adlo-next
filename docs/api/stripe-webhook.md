# POST /api/stripe/webhook

Track B Stripe webhook endpoint. The legacy `/api/webhook/stripe` route re-exports the same handler for compatibility.

## Auth

Verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.

## Handled Events

### `checkout.session.completed`

- Requires Stripe customer id, subscription id, and email.
- Upserts `customers` by `stripe_customer_id`.
- Retrieves the Stripe subscription and upserts `subscriptions`, including `trial_end` for the first-month-free offer.
- Sends onboarding email to `/customer/login?email=...&next=/onboarding`; Auth.js sends the one-time magic link before the customer reaches onboarding.
- Notifies Lorenzo by email.
- Writes `audit_log` action `stripe.checkout.completed`.

### `customer.subscription.deleted`

- Finds the local subscription by `stripe_subscription_id`.
- Sets local subscription status to `cancelled`.
- Sets the related customer service status to `cancelled`.
- Writes `audit_log` action `stripe.subscription.deleted`.
- Sends an idempotent subscription-ended confirmation email and audits the send.

### `customer.subscription.updated`, `invoice.payment_succeeded`, and `invoice.payment_failed`

`customer.subscription.updated`:

- Finds the local subscription by `stripe_subscription_id`.
- Syncs plan, Stripe status, current period, trial end, and cancellation timestamp.
- Maps active/trialing/past_due to customer `service_status = active` during recovery; cancelled to `cancelled`; unpaid/paused/incomplete to `paused`.
- Writes `audit_log` action `stripe.subscription.updated`.
- When `cancel_at_period_end = true`, sends an idempotent cancellation-scheduled email with the access end date.

`invoice.payment_succeeded`:

- Finds the local subscription from the invoice subscription id when Stripe provides it.
- Retrieves the Stripe subscription and syncs status, plan, current period, trial end, and cancellation timestamp.
- Writes `audit_log` action `stripe.invoice.payment_succeeded`.
- If this invoice recovers a failed payment, sends an idempotent payment-recovered email.

`invoice.payment_failed`:

- Finds the local subscription from the invoice subscription id when Stripe provides it.
- Sets local subscription status to `past_due`.
- Keeps the related customer service status active while Stripe reports `past_due`, so one failed charge does not immediately remove access.
- Writes `audit_log` action `stripe.invoice.payment_failed`.
- Sends an idempotent payment-failed email linking to the authenticated customer billing page.

## Payment recovery policy

- Stripe remains the source of truth for retries and terminal subscription status.
- Configure Stripe Smart Retries / revenue recovery to use the approved seven-day recovery window.
- `past_due` keeps product access during that recovery window.
- `unpaid`, `paused`, or `cancelled` changes the customer service status away from active.
- Email links never contain a customer id, Stripe portal session URL, or reusable customer credential.
- Resend idempotency keys use the Stripe invoice or subscription reference so webhook retries do not duplicate customer email.

## Safety

- Webhook logs never include customer OAuth tokens or credentials.
- Audit payload stores Stripe ids and event metadata only.
- No webhook handler implements score-based refunds, ranking guarantees, or outcome refund logic.
- OAuth token handling is intentionally out of Sprint 1.
