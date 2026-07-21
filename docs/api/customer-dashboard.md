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

## Safety

- Read-only only; no customer mutation in this PR.
- No OAuth token handling.
- No OAuth credential is logged.
- Missing or invalid session returns `UNAUTHORIZED`.
- `?customer_id=<uuid>` does not grant access because customer identity comes from the Auth.js session.
