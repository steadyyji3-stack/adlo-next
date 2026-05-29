# Admin GBP Reviews API

Track B3 foundation for customer GBP review reply workflow.

## GET /api/admin/reviews

Requires the existing `admin_token` cookie.

Optional query:

- `customer_id`: filters by `gbp_reviews.customer_id`
- `reply_status`: filters by `gbp_reviews.reply_status`
- `unanswered=true`: shortcut for `reply_status = pending`

Returns recent GBP review rows with lightweight customer metadata.

## GET /api/admin/reviews/[id]

Requires the existing `admin_token` cookie.

Returns one GBP review row with lightweight customer metadata.

## PATCH /api/admin/reviews/[id]

Requires the existing `admin_token` cookie.

Allowed fields:

- `reply_text`
- `reply_status`: `pending`, `drafted`, or `posted`

When `reply_status` is set to `posted`, the local `reply_posted_at` timestamp is set. This is a local status marker only.

Writes `audit_log` action `gbp_review.reply_update` with customer id, updated field names, reply status, and whether reply text exists.

## Admin UI

`/admin/reviews` is the first local review reply workbench:

- stats for total, pending, drafted, and posted rows
- optional unanswered filter
- latest review table
- reply draft editor
- local reply status editor

## Safety

- This PR does not call Google Business Profile APIs.
- This PR does not post replies externally.
- This PR does not touch OAuth tokens.
- Audit payload does not store full review text or reply text.
