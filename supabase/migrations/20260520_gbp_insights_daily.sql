-- Track B: Google Business Profile daily insights foundation.
-- This table is ready for future GBP API imports but does not store OAuth tokens or credentials.

create table gbp_insights_daily (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  date date not null,
  business_impressions int not null default 0 check (business_impressions >= 0),
  website_clicks int not null default 0 check (website_clicks >= 0),
  phone_calls int not null default 0 check (phone_calls >= 0),
  direction_requests int not null default 0 check (direction_requests >= 0),
  messages int not null default 0 check (messages >= 0),
  source text not null default 'manual' check (source in ('manual', 'gbp_api', 'imported')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, date)
);

create index idx_gbp_insights_customer_date on gbp_insights_daily(customer_id, date desc);
create index idx_gbp_insights_date on gbp_insights_daily(date desc);

create trigger gbp_insights_daily_set_updated_at
before update on gbp_insights_daily
for each row execute function set_updated_at();
