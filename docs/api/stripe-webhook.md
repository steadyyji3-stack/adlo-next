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

### `customer.subscription.updated`, `invoice.payment_succeeded`, and `invoice.payment_failed`

`customer.subscription.updated`:

- Finds the local subscription by `stripe_subscription_id`.
- Syncs plan, Stripe status, current period, trial end, and cancellation timestamp.
- Maps active/trialing to customer `service_status = active`; cancelled to `cancelled`; other non-good states to `paused`.
- Writes `audit_log` action `stripe.subscription.updated`.

`invoice.payment_succeeded`:

- Finds the local subscription from the invoice subscription id when Stripe provides it.
- Retrieves the Stripe subscription and syncs status, plan, current period, trial end, and cancellation timestamp.
- Writes `audit_log` action `stripe.invoice.payment_succeeded`.

`invoice.payment_failed`:

- Finds the local subscription from the invoice subscription id when Stripe provides it.
- Sets local subscription status to `past_due`.
- Sets the related customer service status to `paused`.
- Writes `audit_log` action `stripe.invoice.payment_failed`.

## Safety

- Webhook logs never include customer OAuth tokens or credentials.
- Audit payload stores Stripe ids and event metadata only.
- No webhook handler implements score-based refunds, ranking guarantees, or outcome refund logic.
- OAuth token handling is intentionally out of Sprint 1.
