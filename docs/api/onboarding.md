# POST /api/onboarding

Track B endpoint for customer onboarding form submissions.

## Auth

Public foundation flow, gated by the customer id resolved from the onboarding email link.

Preferred page access is `/onboarding?customer_token=...`. The page still accepts `customer_id` during transition and passes the resolved customer id to the submit API.

## Request

```json
{
  "customerId": "uuid",
  "storeName": "店名",
  "storeAddress": "地址",
  "storeCity": "台北市",
  "gbpUrl": "https://maps.google.com/...",
  "websiteUrl": "https://example.com",
  "phone": "02...",
  "lineId": "line-id",
  "industry": "餐飲",
  "signatureItems": ["招牌商品"],
  "ga4PropertyId": "123456",
  "metaPageId": "123456",
  "notes": "補充說明"
}
```

## Behavior

- Validates payload with Zod.
- Updates the matching `customers` row.
- Creates an `onboarding_submissions` row with `pending_review`.
- Writes `audit_log` action `onboarding.submit`.
- Does not store OAuth credentials in Sprint 1.

## Response

```json
{ "ok": true, "customer": {}, "submission": {} }
```

Errors use:

```json
{ "ok": false, "error": { "code": "VALIDATION_FAILED", "message": "..." } }
```
