# Monthly Reports

Track B foundation for customer monthly report generation.

## GET /api/admin/reports/[customerId]/preview?period=YYYY-MM

Requires the existing `admin_token` cookie.

Returns an in-memory report preview built from existing Track B tables:

- `customers`
- `subscriptions`
- `gbp_posts`
- `gbp_reviews`
- `keyword_rankings`
- `ad_spend_daily`

Response:

```json
{
  "ok": true,
  "report": {
    "customer": {},
    "period": {},
    "metrics": {},
    "completedItems": [],
    "nextActions": [],
    "customerRequests": [],
    "recentPosts": [],
    "recentReviews": [],
    "latestRankings": []
  }
}
```

If `period` is omitted, the current month is used. `period` must be `YYYY-MM`.

## Admin HTML Preview

`/admin/reports/[customerId]/preview?period=YYYY-MM` renders a four-section HTML preview matching the monthly report structure:

1. Cover
2. KPI summary
3. Delivery log
4. Next actions and customer requests

The preview is intentionally HTML-first. The next PR can reuse `buildMonthlyReportPreview()` to render PDF output and write the resulting file URL to `monthly_reports.pdf_url`.

## Safety

- Read-only only; this PR does not insert `monthly_reports` rows.
- No PDF placeholder URL is written.
- No email is sent.
- No customer OAuth token handling.
- API errors log only error messages, not customer credentials or external tokens.
