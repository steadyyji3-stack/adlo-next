# Customer Billing APIs

Track B1 foundation for customer subscription self-service.

## Temporary Customer Access

Until the customer dashboard moves to full customer auth, these endpoints prefer signed customer links:

- `customer_token` query param
- `customer_token` cookie

During transition, these endpoints still accept:

- `customer_id` query param
- `customer_id` cookie
- `customer_id` JSON body for `POST /api/me/cancel`

## `GET /api/me/subscription`

Returns the customer subscription snapshot.

Example:

```http
GET /api/me/subscription?customer_token=...
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
{
  "customer_id": "00000000-0000-0000-0000-000000000000"
}
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

`/customer/billing?customer_token=...`

- Shows the current subscription.
- Opens Stripe Customer Portal for payment method management or cancellation.
- Does not cancel locally. Stripe remains the source of truth.

## Safety

- This PR does not manually cancel subscriptions in the database.
- This PR does not store Stripe Customer Portal URLs in `audit_log`.
- This PR does not log OAuth credentials, API keys, tokens, request headers, or payment method data.
- Subscription state changes still come from Stripe webhooks.
