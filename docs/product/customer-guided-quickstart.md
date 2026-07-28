# Customer guided quickstart

## Goal

Help a store owner with no SEO knowledge reach a useful result without waiting for adlo staff. The primary journey is quick completion; explanations are available inside the task when the customer needs them.

## Journey

1. The dashboard shows one persistent four-step quickstart: save the store profile, receive a task, record the first result, and complete a second week.
2. Onboarding asks for the same existing store-profile fields in four short screens. It does not request Google account access.
3. The weekly task shows one stage at a time: understand, act, record, and review the result.
4. Customers can request a plain-language task that takes no more than ten minutes with one button.
5. After two distinct completed weeks, the quickstart collapses and the dashboard becomes a returning-customer workspace.

## State source

Quickstart progress is derived on the server from the existing `customer_store_profiles` record and distinct completed `customer_growth_cycles.week_start` values. Browser storage is not used, and no parallel customer-profile schema is introduced.

## Empty states

- A new customer sees orientation and one action instead of empty KPI cards.
- Performance modules appear only when the customer has posts, reviews, rankings, or reports to inspect.
- The growth ledger appears after the first completed week.

## Track B declaration

- Sprint: S3 customer dashboard and self-service journey
- Customer data: reads the existing store profile and growth cycles; onboarding updates the existing customer profile
- Billing: no change
- OAuth: no OAuth and no new Google permissions
- Database schema or RLS: no change
- Environment variables: none

## Acceptance checks

- A new customer can complete onboarding without SEO knowledge or Google authorization.
- Leaving and returning to the dashboard preserves quickstart progress from server data.
- A weekly task exposes only the current stage and cannot be marked complete without the existing outcome evidence validation.
- Desktop and mobile layouts keep step labels, controls, and task content readable without overlap.
