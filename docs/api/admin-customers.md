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

Kept for compatibility. The admin detail UI uses the broader review endpoint below.

## POST /api/admin/customers/[id]/review

Requires the existing `admin_token` cookie.

Request:

```json
{ "decision": "approved", "note": "optional internal note" }
```

Allowed `decision` values:

- `approved`: marks onboarding approved and activates service.
- `needs_revision`: marks onboarding as needing revision and moves service back to pending onboarding.
- `rejected`: marks onboarding rejected and pauses service.

Behavior:

- Marks latest pending onboarding submission with the review decision.
- Sets `reviewed_by = lorenzo` and `reviewed_at`.
- Updates the customer `onboarding_status` and `service_status`.
- Writes one of `onboarding.approve`, `onboarding.request_revision`, or `onboarding.reject`.
- Audit payload records status changes and whether a review note was present, but does not store the note body.

Errors use the shared structured shape:

```json
{ "ok": false, "error": { "code": "UNAUTHORIZED", "message": "請先登入後台" } }
```
