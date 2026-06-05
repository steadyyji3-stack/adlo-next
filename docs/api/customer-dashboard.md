# Customer Dashboard API

Track B foundation for customer-facing post-sale data.

## Temporary auth model

Sprint foundation now prefers a signed customer link token:

- `customer_token` query string
- `customer_token` cookie

Raw customer ids are disabled by default. They are accepted only when `ALLOW_UNSIGNED_CUSTOMER_ID=true`:

- `customer_id` query string
- `customer_id` cookie

DEV ONLY — never set `ALLOW_UNSIGNED_CUSTOMER_ID` in production.

NextAuth magic-link sessions can replace this handoff in a later customer auth PR.

## GET /api/me

Returns the customer dashboard aggregate:

```json
{
  "ok": true,
  "dashboard": {
    "customer": {},
    "latestSubscription": {},
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

`/customer/dashboard?customer_token=...` renders the first customer dashboard:

- service status and store identity
- subscription summary
- KPI cards for posts, reviews, and ranking
- recent GBP posts
- recent GBP reviews and pending reply count
- recent Local SEO ranking rows
- monthly report links

## Safety

- Read-only only; no customer mutation in this PR.
- No OAuth token handling.
- Customer tokens and OAuth credentials are not logged.
- Missing or invalid customer access returns `UNAUTHORIZED`.
- `?customer_id=<uuid>` does not grant production access because it has no HMAC signature.
