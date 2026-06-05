# Customer Signed Links

Track B5 foundation for customer access links before full customer auth.

## Environment

Set `CUSTOMER_LINK_SECRET` to a random value with at least 32 characters.

The secret signs HMAC SHA-256 customer link tokens. It is read only on the server and must not be logged.

Optional local escape hatch:

- `ALLOW_UNSIGNED_CUSTOMER_ID=true`
- DEV ONLY — never set in production.
- Allows raw `customer_id` query/body/cookie values only for local or preview debugging when signed links are not available.

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
- `POST /api/me/cancel` via `customer_token` JSON body

`customer_id` is rejected by default. It is accepted only when `ALLOW_UNSIGNED_CUSTOMER_ID=true`.

## Audit Safety

`customer_link.create` writes:

- destination
- expiry timestamp
- expiry days

It does not store the full URL, token, secret, OAuth credentials, or payment data.

## Why raw UUID links no longer work

`getCustomerIdFromRequest` and `getCustomerIdFromSearchParams` now return a customer id only after `verifyCustomerLinkToken` validates the HMAC signature and expiry. A plain `?customer_id=<uuid>` has no signature, so production requests resolve to `null` and the route returns the customer access gate or `UNAUTHORIZED` instead of loading another customer's data.
