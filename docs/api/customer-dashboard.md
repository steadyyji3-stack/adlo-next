# Customer Dashboard API

Track B foundation for customer-facing post-sale data.

## Temporary auth model

Sprint foundation accepts `customer_id` from either:

- `customer_id` query string
- `customer_id` cookie

NextAuth magic-link sessions will replace this temporary handoff in a later customer auth PR.

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

`/customer/dashboard?customer_id=...` renders the first customer dashboard:

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
- No customer token or OAuth credential is logged.
- Missing `customer_id` returns `UNAUTHORIZED`.
