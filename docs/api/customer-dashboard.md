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
- KPI cards for posts, reviews, and ranking
- recent GBP posts
- recent GBP reviews and pending reply count
- recent Local SEO ranking rows
- monthly report links

## Safety

- Read-only only; no customer mutation in this PR.
- No OAuth token handling.
- No OAuth credential is logged.
- Missing or invalid session returns `UNAUTHORIZED`.
- `?customer_id=<uuid>` does not grant access because customer identity comes from the Auth.js session.
