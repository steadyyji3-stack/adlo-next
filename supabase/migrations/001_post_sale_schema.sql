-- adlo post-sale product schema
-- Track B: customer data, billing, customer history, and API integration records.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table customers (
  id uuid primary key default gen_random_uuid(),
  stripe_customer_id text unique not null,
  email text unique not null,
  name text not null,
  phone text,
  line_id text,
  store_name text not null,
  store_address text,
  store_city text,
  gbp_url text,
  website_url text,
  industry text,
  signature_items text[],
  onboarding_status text not null default 'not_started'
    check (onboarding_status in ('not_started', 'pending_review', 'approved', 'needs_revision', 'rejected')),
  service_status text not null default 'pending_onboarding'
    check (service_status in ('pending_onboarding', 'pending_review', 'active', 'paused', 'cancelled', 'churned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_email on customers(email);
create index idx_customers_city on customers(store_city);
create index idx_customers_onboarding_status on customers(onboarding_status);
create index idx_customers_service_status on customers(service_status);
create trigger customers_set_updated_at
before update on customers
for each row execute function set_updated_at();

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  stripe_subscription_id text unique not null,
  plan_id text not null check (plan_id in ('gbp-auto', 'local-seo', 'ads-managed', 'starter', 'growth', 'dominate')),
  status text not null check (status in ('active', 'trialing', 'paused', 'cancelled', 'past_due', 'incomplete', 'unpaid')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  trial_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subs_customer on subscriptions(customer_id);
create index idx_subs_status on subscriptions(status);
create trigger subscriptions_set_updated_at
before update on subscriptions
for each row execute function set_updated_at();

create table onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'needs_revision', 'rejected')),
  gbp_oauth_ciphertext text,
  ga4_property_id text,
  meta_page_id text,
  meta_admin_status text check (meta_admin_status is null or meta_admin_status in ('invited', 'accepted')),
  notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_onboarding_customer on onboarding_submissions(customer_id);
create index idx_onboarding_status on onboarding_submissions(status);

create table gbp_posts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  scheduled_for timestamptz not null,
  posted_at timestamptz,
  status text not null check (status in ('draft', 'scheduled', 'posted', 'failed')),
  category text not null,
  title text not null,
  content text not null,
  image_hint text,
  image_url text,
  cta_type text,
  cta_url text,
  google_post_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_gbp_posts_customer_date on gbp_posts(customer_id, scheduled_for);
create index idx_gbp_posts_status on gbp_posts(status);

create table gbp_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  google_review_id text unique not null,
  reviewer_name text,
  rating int not null check (rating between 1 and 5),
  comment text,
  posted_at timestamptz,
  reply_text text,
  reply_posted_at timestamptz,
  reply_status text check (reply_status is null or reply_status in ('pending', 'drafted', 'posted')),
  created_at timestamptz not null default now()
);

create index idx_gbp_reviews_customer on gbp_reviews(customer_id, posted_at desc);
create index idx_gbp_reviews_reply_status on gbp_reviews(reply_status);

create table keyword_rankings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  keyword text not null,
  rank_position int check (rank_position is null or rank_position between 1 and 100),
  search_volume int,
  cpc_ntd numeric,
  checked_at timestamptz not null,
  source text not null check (source in ('google_search', 'serp_api'))
);

create index idx_kw_rankings_customer_kw on keyword_rankings(customer_id, keyword, checked_at desc);

create table monthly_reports (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  pdf_url text not null,
  summary_json jsonb not null,
  sent_to_email text,
  sent_at timestamptz,
  generated_at timestamptz not null default now()
);

create unique index idx_reports_customer_period on monthly_reports(customer_id, period_start);

create table ad_spend_daily (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  date date not null,
  platform text not null check (platform in ('google_ads', 'meta_ads')),
  spend_ntd numeric not null,
  impressions int,
  clicks int,
  conversions int,
  created_at timestamptz not null default now()
);

create unique index idx_ads_daily on ad_spend_daily(customer_id, date, platform);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_actor_time on audit_log(actor, created_at desc);
create index idx_audit_target on audit_log(target_type, target_id);
