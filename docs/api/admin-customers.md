# Admin Customers API

Track B endpoints for Lorenzo's customer management workflow.

## GET /api/admin/customers

Requires the existing `admin_token` cookie.

Optional query:

- `status`: filters by `customers.service_status`
- `plan`: filters by matching `subscriptions.plan_id`

Response:

```json
{ "ok": true, "customers": [] }
```

## GET /api/admin/customers/[id]

Requires the existing `admin_token` cookie.

Response includes customer, subscriptions, and onboarding submissions:

```json
{ "ok": true, "customer": {} }
```

## PATCH /api/admin/customers/[id]

Requires the existing `admin_token` cookie.

Allowed fields:

- `name`
- `phone`
- `line_id`
- `store_name`
- `store_address`
- `store_city`
- `gbp_url`
- `website_url`
- `industry`
- `signature_items`
- `service_status`

Writes `audit_log` action `customer.update` with only updated field names.

## POST /api/admin/customers/[id]/approve

Requires the existing `admin_token` cookie.

Behavior:

- Marks latest pending onboarding submission as `approved`.
- Sets customer `onboarding_status` to `approved`.
- Sets customer `service_status` to `active`.
- Writes `audit_log` action `onboarding.approve`.

Errors use the shared structured shape:

```json
{ "ok": false, "error": { "code": "UNAUTHORIZED", "message": "請先登入後台" } }
```
