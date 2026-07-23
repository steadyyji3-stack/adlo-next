# Customer review workspace API

Track B paid feature for drafting, editing, saving, copying, and deleting review replies. It does not request Google OAuth access and never publishes replies to Google Business Profile.

## Prerequisites

- Auth.js customer session from the email magic-link flow.
- Customer subscription status is `active`, `trialing`, or `past_due` for list and generation access.
- Apply `supabase/migrations/20260723_customer_review_drafts.sql` before testing.
- Existing environment variables: `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`.

## Endpoints

### `GET /api/me/review-drafts`

Returns the signed-in customer's latest 50 saved drafts. The server derives `customer_id` from the Auth.js session; callers cannot provide or override it.

### `POST /api/me/review-drafts`

Generates three reply variants and stores the first variant as the selected draft.

```json
{
  "reviewerName": "王小姐",
  "rating": 2,
  "reviewText": "等候時間比預期久，現場人員有說明但還是有點失望。",
  "ownerNote": "當天設備臨時維修，已調整預約間隔。",
  "industry": "牙醫診所"
}
```

The paid quota is 20 successful generations per customer per 24-hour window. A Redis outage is logged without exposing customer text and currently fails open so paid delivery is not blocked.

### `PATCH /api/me/review-drafts/:id`

Updates the selected reply and its local status. Both `id` and the session-derived `customer_id` are included in the database filter to prevent cross-customer access.

```json
{
  "selectedReply": "謝謝你願意告訴我們當天的感受……",
  "status": "copied"
}
```

### `DELETE /api/me/review-drafts/:id`

Deletes one draft owned by the signed-in customer. Deletion is permanent.

## Data and security

- RLS is enabled with no anon or authenticated Data API policy. Server routes use the service role only after Auth.js authorization.
- Review text and owner notes are sent to Groq and stored in `customer_review_drafts`.
- The UI tells customers to remove non-public personal data before generation.
- Audit payloads contain only lengths, rating, variant count, token usage, status, and record IDs. They do not include review text, reply text, credentials, or tokens.
- Generated content is an editable draft. No endpoint publishes to Google or another third party.
