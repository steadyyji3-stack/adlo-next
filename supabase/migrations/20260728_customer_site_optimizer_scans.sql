-- Track B paid product: immutable, low-data snapshots for site optimizer history.
-- Raw HTML, generated copy, OAuth credentials, and customer secrets are never stored here.

create table customer_site_optimizer_scans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  hostname text not null
    check (char_length(hostname) between 1 and 253),
  target_url text not null
    check (char_length(target_url) between 1 and 2048),
  industry_mode text not null
    check (industry_mode in ('restaurant', 'clinic', 'retail', 'local_business')),
  coverage text not null
    check (coverage in ('sitemap', 'homepage_only')),
  overall_score smallint not null
    check (overall_score between 0 and 100),
  page_count smallint not null
    check (page_count between 1 and 8),
  snapshot_version smallint not null default 1
    check (snapshot_version = 1),
  snapshot jsonb not null
    check (jsonb_typeof(snapshot) = 'object')
    check (snapshot ? 'version')
    check (snapshot ? 'pages'),
  scanned_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_customer_site_optimizer_scans_history
  on customer_site_optimizer_scans (customer_id, hostname, scanned_at desc);

alter table customer_site_optimizer_scans enable row level security;

-- Server routes access this table only after Auth.js customer-session checks.
-- No anon or authenticated Data API policies are intentionally granted.
revoke all on table customer_site_optimizer_scans from anon, authenticated;

