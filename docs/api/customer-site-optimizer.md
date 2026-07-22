# Customer Site Optimizer API

Track B paid self-service endpoint for generating a read-only website optimization pack.

## Endpoint

`POST /api/me/site-optimizer`

Authentication: Auth.js customer session cookie. The customer must have an `active`, `trialing`, or `past_due` subscription.

Request:

```json
{
  "url": "https://example.tw"
}
```

The requested hostname must match the customer's `customers.website_url` hostname. `www` and apex variants are treated as the same registered site. Customers update the registered URL through onboarding; this endpoint cannot scan arbitrary domains.

## Behavior

- Fetches public `http` or `https` pages only.
- Attempts `/sitemap.xml`, then audits at most eight same-site representative pages.
- Limits redirects, response time, HTML size, sitemap size, and sitemap nesting.
- Resolves every requested or redirected hostname, rejects private, loopback, link-local, reserved, multicast, and documentation IP ranges, then pins the HTTP connection to the validated public IP to prevent DNS rebinding.
- Parses HTML and XML with Cheerio instead of regular expressions.
- Produces deterministic restaurant, clinic, retail, or general local-business recommendations from the customer's stored profile.
- Returns recommendations only. It never logs into a CMS, changes a website, publishes content, or requests Google OAuth access.

The successful scan writes `customer.site_optimizer.scan` to `audit_log`. The payload contains only customer id, hostname, page count, coverage, and industry mode. Page HTML and generated content are not stored.

## Response

The success response includes:

- `overallScore` and representative page checks.
- prioritized fixes with affected paths.
- title, meta description, H1, and content-section blueprints.
- `LocalBusiness` subtype JSON-LD built only from stored customer data.
- FAQ drafts and an implementation checklist.
- limitations that explicitly avoid ranking or Rich Result guarantees.

Clinic mode sets `requiresHumanReview: true`, excludes efficacy guarantees and fabricated testimonials, and requires the clinic to review legal and factual accuracy before publishing.

## Expected errors

| Code | Status | Meaning |
| --- | ---: | --- |
| `UNAUTHORIZED` | 401 | Missing customer session |
| `SUBSCRIPTION_REQUIRED` | 402 | No paid access status |
| `WEBSITE_HOST_MISMATCH` | 403 | URL is not the registered customer site |
| `PRIVATE_DESTINATION` | 403 | DNS or literal IP resolves to a blocked network |
| `STORE_PROFILE_REQUIRED` | 409 | Server-side store profile is missing |
| `WEBSITE_REQUIRED` | 409 | Onboarding website URL is missing |
| `SITE_FETCH_FAILED` | 422 | Public site cannot be read |
| `CONTENT_TOO_LARGE` | 422 | Response exceeds the configured size cap |
| `SITE_TIMEOUT` | 504 | Public site did not respond in time |

## Infrastructure

- New environment variables: none.
- New database schema or migration: none.
- New OAuth scope: none.
- Runtime: Node.js, `maxDuration = 60`.
- Parser dependency: `cheerio@1.2.0` (requires Node.js `>=20.18.1`).
