# GET /api/me/store-profile

Returns the signed-in customer's server-side store profile. A customer with no
saved profile receives:

    { "ok": true, "profile": null }

## Auth

Requires a verified Auth.js customer session. Query strings, cookies named
customer_id, and request-body customer IDs are ignored.

# PUT /api/me/store-profile

Creates or replaces the signed-in customer's server-side store profile.

## Request

The request body reuses the Track A StoreProfileInput field names:

    {
      "storeName": "Lorenzo Cafe",
      "industry": "餐飲",
      "selectedTags": ["親子友善", "手工製作"],
      "weekTheme": "暑假親子活動",
      "businessType": "在地店家",
      "channels": ["Google 商家", "LINE"]
    }

The server supplies savedAt; clients cannot choose it.

## Behavior

- Stores the profile as JSONB without creating a second product-specific field model.
- Keeps customers.store_name and customers.industry synchronized.
- Writes audit_log action customer.store_profile.update.
- Never stores OAuth tokens or Google account credentials.

## Response

    { "ok": true, "profile": {} }
