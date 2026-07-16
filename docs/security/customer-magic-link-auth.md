# Customer Magic-Link Auth

Track B5 implementation note for the customer dashboard auth migration.

## Decision

Lorenzo selected Option B on 2026-06-05:

- return to `01-backend-spec.md` section 6
- use Auth.js / NextAuth v5 email magic-link
- persist customer sessions in database-backed HTTP-only cookies
- retire PR #53 signed URL token route

## Runtime Environment

Required:

- `AUTH_SECRET`: random production secret used by Auth.js
- `AUTH_URL`: canonical app URL for Auth.js, usually `https://adlo.tw`
- `NEXT_PUBLIC_SITE_URL`: canonical app URL used by Stripe emails and return URLs
- `RESEND_API_KEY`: sends customer magic-link emails
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not set:

- `CUSTOMER_LINK_SECRET`
- `ALLOW_UNSIGNED_CUSTOMER_ID`

Those belonged to the retired signed-URL direction.

## Database

Migration:

- `supabase/migrations/20260605_authjs_customer_sessions.sql`

Tables:

- `authjs_users`
- `authjs_accounts`
- `authjs_sessions`
- `authjs_verification_tokens`

The tables are named `authjs_*` to avoid colliding with Supabase Auth's own `auth` schema.

## Login Flow

1. Customer opens `/customer/login`.
2. Customer enters the subscribed email.
3. Auth.js creates a short-lived verification token.
4. Resend sends the one-time login link.
5. Customer clicks the link.
6. Auth.js creates a database session and stores the session token in an HTTP-only cookie.
7. Customer reaches `/customer/dashboard`, `/customer/billing`, or `/onboarding`.

Only emails that already exist in the Track B `customers` table can sign in.

## Protected Routes

Middleware gates:

- `/customer/*`
- `/onboarding`

Login routes are excluded:

- `/customer/login`
- `/customer/login/check-email`

The middleware verifies the Auth.js session and only allows customer paths when `session.user.customerId` is present. The pages and `/api/me/*` routes still resolve the actual customer id from `auth()` on the server, so a forged or stale cookie cannot load customer data.

## Customer Identity

Customer-facing identity is resolved from:

- `auth()`
- `session.user.email`
- matching `customers.email`
- `session.user.customerId`

These are no longer trusted:

- `?customer_id=<uuid>`
- `customer_id` cookie
- JSON body `{ "customer_id": "..." }`
- onboarding body `{ "customerId": "..." }`
- signed URL `customer_token`

## Why The P0 Is Closed

Before this migration, `/customer/dashboard`, `/customer/billing`, `/onboarding`, `/api/onboarding`, and `/api/me/*` could resolve a customer from raw `customer_id` query/cookie/body values.

After this migration, those values are ignored. A request with only `?customer_id=<uuid>` has no verified Auth.js session with `session.user.customerId`, so middleware redirects to `/customer/login`, and server routes return `UNAUTHORIZED`.

## Stripe Email Impact

`checkout.session.completed` welcome email now links to:

`/customer/login?email=...&next=/onboarding`

The customer receives the Auth.js magic link from Resend and lands on `/onboarding` after login.
