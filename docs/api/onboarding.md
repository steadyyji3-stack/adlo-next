# POST /api/onboarding

Track B endpoint for self-service customer onboarding.

## Auth

Protected by the customer Auth.js session.

The Stripe welcome email sends customers to
/customer/login?email=...&next=/onboarding. After the customer uses the email
magic link, /onboarding resolves customerId from session.user.customerId.

Raw customer_id query strings are not trusted.

## Request

    {
      "storeProfile": {
        "storeName": "店名",
        "industry": "餐飲",
        "selectedTags": ["親子友善", "手工製作"],
        "weekTheme": "暑假親子活動",
        "businessType": "在地店家",
        "channels": ["Google 商家", "LINE"]
      },
      "storeAddress": "地址",
      "storeCity": "台北市",
      "gbpUrl": "https://maps.google.com/...",
      "websiteUrl": "https://example.com",
      "phone": "02...",
      "lineId": "line-id",
      "signatureItems": ["招牌商品"],
      "notes": "補充說明"
    }

## Behavior

- Validates the payload with Zod.
- Resolves customerId from the Auth.js session.
- Persists the Track A StoreProfile shape unchanged in customer_store_profiles.profile.
- Updates the matching customers contact and store summary fields.
- Creates one already-approved onboarding_submissions history row on first completion.
- Repeated submissions update the same self-service history row instead of creating duplicates.
- Activates service when the customer has an active or trialing subscription.
- Writes audit_log action onboarding.complete on first completion and onboarding.update on later saves.
- Does not request or store OAuth credentials.
- Does not require admin review.

## Response

    { "ok": true, "customer": {}, "submission": {}, "profile": {}, "submissionCreated": true }

The first completion returns `201`. A later self-service update returns `200`
with `submissionCreated: false`.

Errors use:

    { "ok": false, "error": { "code": "VALIDATION_FAILED", "message": "..." } }
