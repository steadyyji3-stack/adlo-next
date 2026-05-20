# Admin GBP Insights API

Track B3 foundation for Google Business Profile daily performance data.

## Schema

Migration: `supabase/migrations/20260520_gbp_insights_daily.sql`

Creates `gbp_insights_daily`:

- `customer_id`
- `date`
- `business_impressions`
- `website_clicks`
- `phone_calls`
- `direction_requests`
- `messages`
- `source`: `manual`, `gbp_api`, or `imported`

The table has a unique `(customer_id, date)` constraint so the future GBP API importer can avoid duplicate daily rows.

## `GET /api/admin/gbp-insights`

Requires the existing `admin_token` cookie.

Optional query params:

- `customer_id`

Response:

```json
{
  "ok": true,
  "insights": [],
  "summary": {
    "totalImpressions": 0,
    "totalActions": 0,
    "websiteClicks": 0,
    "phoneCalls": 0,
    "directionRequests": 0,
    "messages": 0
  }
}
```

## `POST /api/admin/gbp-insights`

Requires the existing `admin_token` cookie.

Body:

```json
{
  "customer_id": "00000000-0000-0000-0000-000000000000",
  "date": "2026-05-20",
  "business_impressions": 320,
  "website_clicks": 18,
  "phone_calls": 6,
  "direction_requests": 11,
  "messages": 2,
  "source": "manual"
}
```

Creates `gbp_insight.create` in `audit_log`.

## Admin UI

`/admin/gbp-insights`

- View latest GBP daily insight rows.
- See aggregate impressions and action totals.
- Manually add customer daily insights.

## Safety

- This PR does not call Google Business Profile APIs.
- This PR does not add OAuth, token refresh, or decrypt-on-use logic.
- This PR does not store OAuth tokens, API keys, request headers, or credentials.
- Audit payload includes metric metadata only.
