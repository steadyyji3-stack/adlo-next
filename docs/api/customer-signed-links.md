# Customer Signed Links

Track B5 foundation for customer access links before full customer auth.

## Environment

Set `CUSTOMER_LINK_SECRET` to a random value with at least 32 characters.

The secret signs HMAC SHA-256 customer link tokens. It is read only on the server and must not be logged.

## Admin API

`POST /api/admin/customer-links`

Requires the existing admin cookie.

Request:

```json
{
  "customer_id": "00000000-0000-0000-0000-000000000000",
  "destination": "dashboard",
  "expires_in_days": 30
}
```

`destination` can be:

- `dashboard`
- `billing`
- `onboarding`

Response:

```json
{
  "ok": true,
  "url": "https://adlo.tw/customer/dashboard?customer_token=...",
  "expires_at": "2026-07-05T00:00:00.000Z",
  "customer": {
    "id": "00000000-0000-0000-0000-000000000000",
    "email": "owner@example.com",
    "store_name": "Demo Store"
  }
}
```

## Admin UI

`/admin/customer-links`

Lorenzo can choose a customer, destination, and expiry window, then copy the signed URL.

## Customer Routes

These routes now accept `customer_token`:

- `/customer`
- `/customer/dashboard`
- `/customer/billing`
- `/onboarding`
- customer read APIs that use `getCustomerIdFromRequest`

`customer_id` remains accepted as a temporary transition fallback.

## Audit Safety

`customer_link.create` writes:

- destination
- expiry timestamp
- expiry days

It does not store the full URL, token, secret, OAuth credentials, or payment data.
