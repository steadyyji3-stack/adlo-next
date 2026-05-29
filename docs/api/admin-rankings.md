# Admin Keyword Rankings API

Track B4 foundation for Local SEO Pack ranking history.

## GET /api/admin/rankings

Requires the existing `admin_token` cookie.

Optional query:

- `customer_id`: filters by `keyword_rankings.customer_id`
- `keyword`: filters by exact `keyword_rankings.keyword`

Returns recent ranking rows with lightweight customer metadata plus a summary:

```json
{
  "ok": true,
  "rankings": [],
  "summary": {
    "trackedKeywords": 0,
    "top3": 0,
    "top10": 0,
    "averageRank": null
  }
}
```

## POST /api/admin/rankings

Requires the existing `admin_token` cookie.

Creates one local keyword ranking row.

Request:

```json
{
  "customer_id": "uuid",
  "keyword": "台北 咖啡廳",
  "rank_position": 8,
  "search_volume": 300,
  "cpc_ntd": 42.5,
  "checked_at": "2026-05-19T02:00:00.000Z",
  "source": "google_search"
}
```

`rank_position` may be `null` for not found in top 100.

Writes `audit_log` action `keyword_ranking.create` with customer id, keyword, rank, source, and checked time.

## Admin UI

`/admin/rankings` is the first Local SEO ranking workbench:

- latest ranking rows
- manual ranking entry form
- tracked keyword count
- Top 3 / Top 10 summary
- average rank summary

## Safety

- This PR does not call Google Search or SERP APIs.
- This PR does not store external API tokens.
- Audit payload does not include credentials.
