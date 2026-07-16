# Customer Auth Tradeoff — Signed URL Token vs NextAuth Magic Link

Decision owner: Lorenzo
Scope: Track B customer dashboard, onboarding entry, customer billing, and customer read APIs.
Date: 2026-06-05

## Background

`01-backend-spec.md` section 6 specifies customer dashboard auth as:

- NextAuth.js v5
- email magic link, no password
- session stored in cookie, including `customer_id`
- middleware guarding `/customer/*`

The current PR foundation uses signed URL tokens as an interim customer access model:

- URL carries `customer_token`
- server verifies HMAC signature and expiry
- raw `customer_id` is rejected by default, with a DEV-only escape hatch

This document compares whether Track B should continue hardening signed URL access or return to the original NextAuth magic-link/session model.

## Option A — Keep Signed URL Token

Assumption: this option is not the current minimal version. It would be completed with destination binding, revocation state, short TTL, single-purpose tokens, and stronger operational controls.

### External Exposure

| Area | Assessment |
|---|---|
| URL leakage | Higher risk. The credential lives in the URL, so it can appear in browser history, copied links, screenshots, shared support messages, proxy logs, analytics logs, server logs, and Referer headers when the page loads third-party resources. |
| Token reuse | Unless enforced as single-use, anyone holding the URL can reuse it until expiry or revocation. Even single-use tokens can be awkward for customer flows with back/forward navigation and multiple devices. |
| Destination scope | Destination binding can limit a dashboard token from being used for billing or onboarding, but the token is still a bearer credential for that destination. |
| Customer identity binding | The token can embed `customer_id`, destination, expiry, nonce, and token id. That limits tampering, but not possession-based misuse after leakage. |

### Revocation Difficulty

| Area | Assessment |
|---|---|
| Stateless HMAC token | Hard to revoke before expiry unless every token also has a server-side token id or version check. |
| Revocation table | Needs DB table such as `customer_access_tokens` with `id`, `customer_id`, `destination`, `expires_at`, `used_at`, `revoked_at`, `created_by`, and possibly `last_seen_at`. |
| Bulk revocation | Possible with a per-customer `access_token_version`, but this requires adding version checks to every verification path. |
| Operational burden | Lorenzo/admin needs a way to revoke a link after support mistakes, wrong recipient emails, customer churn, or suspected forwarding. |

### Customer Experience

| Area | Assessment |
|---|---|
| No password | Good. Customer clicks a link and enters directly. |
| Repeat visits | Convenient while URL is valid, but fragile after expiry. Users may bookmark an expiring credential and hit access gates later. |
| Multi-device | Easy if the link is shared by the customer, but that is also the risk. |
| Support | Simple to explain: "use this link." Harder to explain revocation/expiry when the same link sometimes works and sometimes does not. |

### Implementation Cost

| Area | Assessment |
|---|---|
| Current state | Already partially implemented. |
| Required hardening | Medium. Need destination binding, token id/nonce persistence, revocation checks, single-use or replay policy, audit events, admin revoke UI, tests, and log/Referer hygiene. |
| Middleware | Can be done in helper functions, but proper route protection still needs consistent coverage across pages and `/api/me/*`. |
| Hidden cost | Ongoing security review burden remains because URLs are credentials. |

### Onboarding Email Impact

| Area | Assessment |
|---|---|
| Email content | Direct CTA can link to `/onboarding?customer_token=...`. |
| Token lifetime | Needs careful TTL. Too short increases support load; too long increases exposure window. |
| Wrong recipient | Admin must revoke the link. Without revocation, the only mitigation is waiting for expiry or rotating global secret, which is too broad. |
| Customer dashboard handoff | The same email link can open onboarding or dashboard, but the token should be destination-bound to avoid scope creep. |

### Summary

Signed URLs are fast and customer-friendly, but they remain bearer credentials in a place that is naturally copied, logged, and leaked. Hardening can reduce blast radius, but cannot remove the core URL exposure problem.

## Option B — Return to Spec: NextAuth Magic Link + Session Cookie

Assumption: customer receives an email magic link, uses it once to establish an HTTP-only session cookie, and then accesses `/customer/*` and `/api/me/*` through session-backed identity.

### External Exposure

| Area | Assessment |
|---|---|
| URL leakage | Lower risk after login. The magic link token can still appear in email, browser history, and logs during the one-time login step, but the durable credential is the session cookie, not the customer dashboard URL. |
| Token reuse | Magic-link tokens should be single-use and short-lived. After use, copied URLs should fail. |
| Session exposure | Session cookie can be protected with `HttpOnly`, `Secure`, `SameSite=Lax` or stricter where possible, and server-side expiry. It is not exposed through Referer headers or normal URL sharing. |
| Customer identity binding | Session stores or resolves `customer_id`; routes do not trust URL customer ids. |

### Revocation Difficulty

| Area | Assessment |
|---|---|
| Session revocation | Easier if sessions are database-backed or have a server-side session store. Admin can expire sessions per customer. |
| Magic-link revocation | One-time verification token naturally expires and can be deleted after use. |
| Customer churn | On cancellation/churn, customer service status can block session access even if a cookie remains valid. |
| Bulk response | Rotate auth secret only for global incident; normal incidents can revoke customer sessions or verification tokens. |

### Customer Experience

| Area | Assessment |
|---|---|
| No password | Good. Still passwordless, aligned with spec. |
| Repeat visits | Better. Customer can return to `/customer/dashboard` without finding the original email while session is valid. |
| Multi-device | Customer requests or clicks a magic link per device. This is a small step but safer than forwarding one dashboard URL. |
| Support | Clearer model: "enter your email and click the login link." Expired links are expected and recoverable. |

### Implementation Cost

| Area | Assessment |
|---|---|
| Current state | Not yet implemented in Track B foundation. |
| Required work | Medium-high. Need NextAuth v5 setup, email provider integration, customer lookup by email, session callback carrying `customer_id`, middleware, route helper changes, and test coverage. |
| Dependencies | Requires auth package/config and production email deliverability. Existing Resend flow can likely support magic-link email, but auth email and onboarding/welcome email need separate semantics. |
| Hidden cost | More moving parts up front, but less long-term custom auth maintenance than a bespoke signed-link revocation system. |

### Onboarding Email Impact

| Area | Assessment |
|---|---|
| Email content | Checkout welcome email can link to `/customer/login?next=/onboarding` or send/trigger a magic link flow. |
| First onboarding | The user may need one extra step: click login magic link, then land in onboarding. This is still passwordless. |
| Wrong recipient | Magic link is short-lived and single-use. If sent to the wrong email, revoke/delete verification token or let it expire. |
| Dashboard handoff | After onboarding, customer can use `/customer/dashboard` directly while session is valid. No credential needs to remain in the URL. |

### Summary

NextAuth magic-link/session auth matches the original spec and removes the durable credential from URLs. It costs more implementation time, but it gives a cleaner long-term security model for billing, reports, rankings, reviews, and future customer actions.

## Side-by-Side Decision Table

| Criterion | A: Signed URL token, fully hardened | B: NextAuth magic link + session cookie |
|---|---|---|
| External leakage surface | Medium-high. URL remains credential; destination binding and short TTL reduce but do not remove leakage. | Lower. Only one-time login URL is sensitive; normal dashboard URLs are not credentials. |
| Revocation difficulty | Medium-high. Needs token ids, revocation table, versioning, and admin tooling. | Medium. Needs session store/revocation, but this is a standard auth concern. |
| Customer experience | Very simple first click; weaker for expiry/bookmark confusion. | Slightly more login ceremony; better repeat visits with session cookie. |
| Implementation cost | Medium if hardened properly; low only if accepting higher risk. | Medium-high initial setup; lower custom security maintenance later. |
| Onboarding email impact | Direct onboarding CTA with token; needs TTL/reissue/revocation process. | CTA points to login/magic-link flow with `next=/onboarding`; may add one click but reduces credential exposure. |
| Fit for billing/cancel | Riskier because leaked URL can open billing destination until expiry unless tightly scoped/revoked. | Better. Billing actions happen under session identity and can add fresh auth checks later. |
| Fit for monthly reports/history | Acceptable for low-risk read-only previews if short-lived. | Better for persistent customer portal and report archive. |
| Spec alignment | Diverges from §6. | Matches §6. |

## Recommendation

Recommendation: choose Option B, returning to the spec's NextAuth magic-link + session cookie model for the customer dashboard.

Reason:

- The customer dashboard is becoming a persistent operating system, not a one-off onboarding form. It will include billing, reports, rankings, GBP insights, review drafts, and potentially more customer actions.
- Signed URL tokens are acceptable as a short-term bridge, but even after destination binding and revocation, the URL remains a bearer credential that can leak through normal web behavior.
- NextAuth magic-link keeps the no-password customer experience while moving the durable credential into an HTTP-only session cookie.
- The implementation cost is higher now, but it avoids building and maintaining a custom token revocation/auth system.

Suggested path for Lorenzo approval:

1. Keep PR #53 as an interim hardening PR only if launch timing requires it.
2. Create a follow-up Track B PR titled `[B5-security] feat: add customer magic-link auth`.
3. In that PR, implement NextAuth v5 email magic-link, session cookie, middleware for `/customer/*`, and session-backed `/api/me/*`.
4. After NextAuth is live, remove customer dashboard reliance on URL tokens. Keep signed links only for narrow, short-lived admin-generated handoff flows if Lorenzo still wants them.

## Open Questions For Lorenzo

- Should customer sessions last 7 days, 14 days, or 30 days?
- Should onboarding require a logged-in session immediately, or can first-time onboarding use a one-time token that creates a session?
- Should cancelled/churned customers be allowed to view historical reports, or should session access block them entirely?
- Should billing portal access require a fresh magic-link login if the session is older than a short threshold, such as 15 minutes?
