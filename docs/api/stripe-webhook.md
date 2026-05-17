# POST /api/stripe/webhook

Track B Stripe webhook endpoint. The legacy `/api/webhook/stripe` route re-exports the same handler for compatibility.

## Auth

Verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.

## Handled Events

### `checkout.session.completed`

- Requires Stripe customer id, subscription id, and email.
- Upserts `customers` by `stripe_customer_id`.
- Retrieves the Stripe subscription and upserts `subscriptions`.
- Sends onboarding email with `/onboarding?customer_id=...`.
- Notifies Lorenzo by email.
- Writes `audit_log` action `stripe.checkout.completed`.

### `customer.subscription.deleted`

- Writes `audit_log` action `stripe.subscription.deleted`.
- Full local subscription status sync is kept for the next billing PR.

### `customer.subscription.updated` and `invoice.payment_failed`

- Writes sanitized audit entries for observability.

## Safety

- Webhook logs never include customer OAuth tokens or credentials.
- Audit payload stores Stripe ids and event metadata only.
- OAuth token handling is intentionally out of Sprint 1.
