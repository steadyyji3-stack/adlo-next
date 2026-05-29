# Admin GBP Posts API

Track B3 foundation for the customer GBP content library.

## GET /api/admin/posts

Requires the existing `admin_token` cookie.

Optional query:

- `customer_id`: filters by `gbp_posts.customer_id`
- `status`: filters by `gbp_posts.status`

Returns recent GBP post rows with lightweight customer metadata.

## POST /api/admin/posts

Requires the existing `admin_token` cookie.

Creates a local GBP post draft or scheduled post.

Request:

```json
{
  "customer_id": "uuid",
  "scheduled_for": "2026-05-15T09:00:00.000Z",
  "status": "draft",
  "category": "教育",
  "title": "週末前的保養提醒",
  "content": "post body",
  "image_hint": "optional image direction",
  "cta_type": "learn-more",
  "cta_url": "https://example.com"
}
```

Writes `audit_log` action `gbp_post.create` with customer id, status, category, and scheduled time.

## GET /api/admin/posts/[id]

Requires the existing `admin_token` cookie.

Returns one GBP post row with lightweight customer metadata.

## PATCH /api/admin/posts/[id]

Requires the existing `admin_token` cookie.

Allowed fields:

- `scheduled_for`
- `status`
- `category`
- `title`
- `content`
- `image_hint`
- `image_url`
- `cta_type`
- `cta_url`
- `error_message`

Writes `audit_log` action `gbp_post.update` with only updated field names.

## Admin UI

`/admin/posts` is the first local content-library view:

- stats for total, draft, scheduled, and posted rows
- local draft creation form
- latest GBP post table
- status editor for review workflow

## Safety

- This PR does not call Google Business Profile APIs.
- This PR does not publish posts externally.
- This PR does not touch OAuth tokens.
- Audit payload does not store full post body or credentials.
