# Customer weekly content bundles

Paid Track B API for the authenticated content workspace.

## GET /api/me/content-bundles

Returns up to 12 saved weekly bundles for the signed-in customer, newest first.

Requirements:

- verified Auth.js customer session
- an active, trialing, or payment-recovery (`past_due`) subscription

The endpoint never accepts customer_id from query strings, cookies, or request
bodies.

## POST /api/me/content-bundles

Generates or refreshes the current Asia/Taipei week.

The server reads the customer's saved StoreProfile and creates:

- 7 GBP posts using the existing free Post Writer generator
- 7 LINE broadcasts using the existing free LINE generator
- a StoreProfile snapshot so older weeks remain reproducible

The unique key is customer_id plus week_start. Generating twice in the same week
updates that week's bundle rather than creating duplicates.

Requirements:

- verified Auth.js customer session
- an active, trialing, or payment-recovery (`past_due`) subscription
- a server-side customer store profile

Successful generation writes audit_log action content_bundle.generate. The
audit payload contains the week and output counts, not generated copy or
customer-entered profile values.

## Errors

- 401 UNAUTHORIZED
- 402 SUBSCRIPTION_REQUIRED
- 404 CUSTOMER_NOT_FOUND
- 409 STORE_PROFILE_REQUIRED
- 500 CONTENT_BUNDLES_READ_FAILED or CONTENT_BUNDLE_GENERATE_FAILED

## Database

Migration: supabase/migrations/20260716_customer_content_bundles.sql

Each row contains exactly seven GBP posts and seven LINE broadcasts.

The table has row level security enabled without anon or authenticated Data API
policies. Only server routes using the Supabase service role can access it, after
the route resolves the customer id from the verified Auth.js session and checks
subscription access. Apply the migration before enabling this workspace in a
target environment; no client-facing policy should be added for this server-only
Track B history.
