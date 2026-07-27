# Customer Dashboard API

Track B foundation for customer-facing post-sale data.

## Temporary auth model

Customer dashboard auth now follows the Track B spec:

- Auth.js / NextAuth v5 email magic-link
- database-backed session cookie
- `session.user.customerId` resolved from the subscribed customer email
- middleware gate for `/customer/*`

Raw `customer_id` query strings and cookies are no longer trusted for customer identity.

## GET /api/me

Returns the customer dashboard aggregate:

```json
{
  "ok": true,
  "dashboard": {
    "customer": {},
    "latestSubscription": {},
    "currentGrowthCycle": {},
    "posts": [],
    "reviews": [],
    "rankings": [],
    "reports": [],
    "kpis": {}
  }
}
```

## GET /api/me/subscription

Returns the latest local subscription row for the customer.

## GET /api/me/posts

Returns recent rows from `gbp_posts`.

## GET /api/me/reviews

Returns recent rows from `gbp_reviews`.

## GET /api/me/rankings

Returns recent rows from `keyword_rankings`.

## GET /api/me/reports

Returns recent rows from `monthly_reports`.

## Customer UI

`/customer/dashboard` renders the signed-in customer's dashboard:

- service status and store identity
- subscription summary
- current weekly growth task and completion state
- KPI cards for posts, reviews, and ranking
- recent GBP posts
- recent GBP reviews and pending reply count
- recent Local SEO ranking rows
- monthly report links

Dashboard KPI aggregation reads up to 120 recent post, review, and ranking rows,
then returns the smaller display lists documented above. Monthly boundaries use
`Asia/Taipei`, so activity around UTC month changes is counted in the customer's
Taiwan calendar month.

The Track A `/check` history currently exists only in browser localStorage. This
dashboard does not invent or duplicate that source; a future Track A server data
contract can be consumed here after it exists.

## Weekly digest operations

- Vercel calls `GET /api/cron/customer-weekly-digest` every Monday at 09:00
  Asia/Taipei (`0 1 * * 1`).
- The route requires `Authorization: Bearer <CRON_SECRET>` and rejects secrets
  shorter than 16 characters.
- Resend uses one idempotency key per customer and Taipei week.
- Successful delivery writes `customer.weekly_digest.sent` to `audit_log`.
- Per-customer failure writes `customer.weekly_digest.failed` with only the week
  and a stable error code. Email addresses, message bodies, provider errors, and
  credentials are never written to the audit payload.
- A failed sent-audit can be retried without delivering a duplicate email because
  the Resend idempotency key remains unchanged.

Weekly task generation also uses a 40-second Upstash lease scoped to customer and
Taipei week. Concurrent requests return `GROWTH_GENERATION_IN_PROGRESS` without
calling the AI provider. Production fails closed with
`GROWTH_GENERATION_UNAVAILABLE` when the lock service is not configured or cannot
be reached; local development can continue with the template fallback.

## Safety

- Dashboard reads remain read-only. `/api/me/growth-cycle` is the only customer
  mutation in this flow and writes only the session customer's weekly cycle.
- Generate, regenerate, complete, digest success, and digest failure actions are
  recorded in `audit_log` without prompts, email content, or credentials.
- No OAuth token handling.
- No OAuth credential is logged.
- Missing or invalid session returns `UNAUTHORIZED`.
- `?customer_id=<uuid>` does not grant access because customer identity comes from the Auth.js session.
