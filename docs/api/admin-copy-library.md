# Admin Copy Library API

Track B3 foundation for reusable post-sale copy assets.

## Schema

Migration: `supabase/migrations/002_copy_assets.sql`

Creates `copy_assets`:

- `customer_id`: nullable. `null` means the asset is global.
- `channel`: `gbp_post`, `review_reply`, `monthly_report`, or `ads_copy`.
- `status`: `draft`, `approved`, or `archived`.
- `source`: `manual`, `groq`, or `imported`.
- `tags`: optional `text[]`.

## `GET /api/admin/copy-library`

Requires the existing `admin_token` cookie.

Optional query params:

- `customer_id`
- `channel`
- `status`

Response:

```json
{
  "ok": true,
  "assets": []
}
```

## `POST /api/admin/copy-library`

Requires the existing `admin_token` cookie.

Body:

```json
{
  "customer_id": null,
  "channel": "gbp_post",
  "title": "母親節預約提醒",
  "body": "本週母親節檔期...",
  "tone": "溫暖",
  "category": "節慶",
  "status": "draft",
  "tags": ["節慶", "預約"]
}
```

Creates `copy_asset.create` in `audit_log`.

## `PATCH /api/admin/copy-library/:id`

Requires the existing `admin_token` cookie.

Accepts partial fields from the create body, most commonly:

```json
{
  "status": "approved"
}
```

Creates `copy_asset.update` in `audit_log`.

## Admin UI

`/admin/copy-library`

- Create global or customer-specific assets.
- Assign usage channel, category, tone, tags, and status.
- Approve or archive copy assets.

## Safety

- This PR does not call GBP, Google Ads, SERP, or email APIs.
- This PR does not generate copy with Groq.
- Audit payload stores metadata only: customer id, channel, status, title, source, and updated field names.
- No OAuth token, API key, or customer credential is stored in this table.
