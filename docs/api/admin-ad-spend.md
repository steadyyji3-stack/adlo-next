# Admin Ad Spend API

Track B4 foundation for Ads Managed daily spend data.

## Schema

Uses the existing `ad_spend_daily` table from `supabase/migrations/001_post_sale_schema.sql`.

Fields:

- `customer_id`
- `date`
- `platform`: `google_ads` or `meta_ads`
- `spend_ntd`
- `impressions`
- `clicks`
- `conversions`

The existing unique index on `(customer_id, date, platform)` is used for upsert behavior.

## `GET /api/admin/ad-spend`

Requires the existing `admin_token` cookie.

Optional query params:

- `customer_id`
- `platform`

Response:

```json
{
  "ok": true,
  "rows": [],
  "summary": {
    "totalSpendNtd": 0,
    "impressions": 0,
    "clicks": 0,
    "conversions": 0,
    "averageCpcNtd": null
  }
}
```

## `POST /api/admin/ad-spend`

Requires the existing `admin_token` cookie.

Body:

```json
{
  "customer_id": "00000000-0000-0000-0000-000000000000",
  "date": "2026-05-25",
  "platform": "google_ads",
  "spend_ntd": 1200,
  "impressions": 8200,
  "clicks": 180,
  "conversions": 12
}
```

Creates or updates the row for the same customer, date, and platform.

Creates `ad_spend.upsert` in `audit_log`.

## Admin UI

`/admin/ad-spend`

- View latest daily ad spend rows.
- See aggregate spend, impressions, clicks, and average CPC.
- Manually create or update daily spend rows.

## Safety

- This PR does not call Google Ads APIs.
- This PR does not add OAuth, developer token, refresh token, or decrypt-on-use logic.
- This PR does not store API keys, OAuth credentials, request headers, or tokens.
- Audit payload includes spend metric metadata only.
