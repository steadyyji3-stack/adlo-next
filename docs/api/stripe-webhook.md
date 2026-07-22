# POST /api/stripe/webhook

Track B Stripe webhook endpoint. The legacy `/api/webhook/stripe` route re-exports the same handler for compatibility.

## Auth

Verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`.

## Handled Events

### `checkout.session.completed`

- Requires Stripe customer id, subscription id, and email.
- Upserts `customers` by `stripe_customer_id`.
- Retrieves the Stripe subscription and upserts `subscriptions`, including `trial_end` for the first-month-free offer.
- Reuses an existing customer matched by Stripe customer id or normalized subscription email without resetting store, onboarding, or service data.
- Existing customers keep their stored login email; a changed Checkout billing email does not silently replace the Auth.js identity.
- Restores an approved returning customer according to Stripe's current subscription status; a new customer remains pending onboarding.
- Sends onboarding email to `/customer/login?next=/onboarding`; the URL does not contain customer email or a reusable credential.
- Sends customer and Lorenzo notifications keyed independently by Checkout Session id, with Resend plus `audit_log` deduplication.
- Writes `audit_log` action `stripe.checkout.completed`.

### `customer.subscription.deleted`

- Finds the local subscription by `stripe_subscription_id`.
- Sets local subscription status to `cancelled`.
- Sets the related customer service status to `cancelled`.
- Writes `audit_log` action `stripe.subscription.deleted`.
- Sends an idempotent subscription-ended confirmation email and audits the send.

### `customer.subscription.updated` and `customer.subscription.trial_will_end`

`customer.subscription.updated`:

- Finds the local subscription by `stripe_subscription_id`.
- Syncs plan, Stripe status, current period, trial end, and cancellation timestamp.
- Maps active/trialing/past_due to customer `service_status = active` during recovery; cancelled to `cancelled`; unpaid/paused/incomplete to `paused`.
- Writes `audit_log` action `stripe.subscription.updated`.
- When `cancel_at_period_end = true`, sends an idempotent cancellation-scheduled email with the access end date.

`customer.subscription.trial_will_end`:

- Syncs the latest Stripe subscription state before sending customer communication.
- Writes `audit_log` action `stripe.subscription.trial_will_end`.
- Sends an idempotent first-month-free ending reminder with the trial end date and a link to the authenticated billing page.
- Skips the conversion reminder when cancellation is already scheduled at period end.

### `invoice.payment_succeeded`, `invoice.payment_failed`, and `invoice.payment_action_required`

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
- Sends an idempotent payment-attention email linking to the authenticated customer billing page.

`invoice.payment_action_required`:

- Retrieves the Stripe subscription and syncs its current state instead of assuming a local status.
- Writes `audit_log` action `stripe.invoice.payment_action_required`.
- Sends the same payment-attention email used by `invoice.payment_failed`, covering payment method updates and bank authentication.
- Uses the same invoice-based audit reference and Resend idempotency key as `invoice.payment_failed`, so the two events cannot produce duplicate emails for one invoice.

## Payment recovery policy

- Stripe remains the source of truth for retries and terminal subscription status.
- Configure Stripe Smart Retries / revenue recovery to use the approved seven-day recovery window.
- `past_due` keeps product access during that recovery window.
- `unpaid`, `paused`, or `cancelled` changes the customer service status away from active.
- Email links never contain a customer id, Stripe portal session URL, or reusable customer credential.
- Resend idempotency keys use the Stripe invoice or subscription reference so webhook retries do not duplicate customer email.
- Trial-ending reminders are keyed by Stripe subscription id plus trial end date and are not sent for subscriptions already scheduled to cancel.

## Safety

- Webhook logs never include customer OAuth tokens or credentials.
- Audit payload stores Stripe ids and event metadata only.
- No webhook handler implements score-based refunds, ranking guarantees, or outcome refund logic.
- OAuth token handling is intentionally out of Sprint 1.
