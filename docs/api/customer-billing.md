# Customer Billing APIs

Track B1 foundation for customer subscription self-service.

## Customer Access

Customer billing uses the same Auth.js session as the customer dashboard:

- email magic-link login
- database-backed session cookie
- `session.user.customerId`

Raw `customer_id` query params, cookies, and JSON bodies are no longer trusted for production identity.

## `GET /api/me/subscription`

Returns the customer subscription snapshot.

Example:

```http
GET /api/me/subscription
```

Response:

```json
{
  "ok": true,
  "customer": {
    "id": "00000000-0000-0000-0000-000000000000",
    "email": "owner@example.com",
    "name": "Owner",
    "store_name": "Demo Store",
    "service_status": "active"
  },
  "subscription": {
    "plan_id": "growth",
    "status": "active"
  }
}
```

## `POST /api/me/cancel`

Creates a Stripe Customer Portal session and returns the redirect URL.

Body:

```json
{}
```

Response:

```json
{
  "ok": true,
  "url": "https://billing.stripe.com/..."
}
```

Creates `billing.portal_session.create` in `audit_log`.

## Customer UI

`/customer/billing`

- Shows the current subscription.
- Opens Stripe Customer Portal for payment method management or cancellation.
- Does not cancel locally. Stripe remains the source of truth.

## Safety

- This PR does not manually cancel subscriptions in the database.
- This PR does not store Stripe Customer Portal URLs in `audit_log`.
- This PR does not log OAuth credentials, API keys, tokens, request headers, or payment method data.
- Subscription state changes still come from Stripe webhooks.
- `?customer_id=<uuid>` and body `{ "customer_id": "..." }` do not grant access.
