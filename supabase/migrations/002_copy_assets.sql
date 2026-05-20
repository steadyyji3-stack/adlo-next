-- Track B: reusable copy library for post-sale operations.
-- Stores approved/draft copy snippets for GBP posts, review replies, monthly reports, and ads copy.

create table copy_assets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  channel text not null check (channel in ('gbp_post', 'review_reply', 'monthly_report', 'ads_copy')),
  title text not null,
  body text not null,
  tone text,
  category text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'archived')),
  source text not null default 'manual' check (source in ('manual', 'groq', 'imported')),
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_copy_assets_customer on copy_assets(customer_id, created_at desc);
create index idx_copy_assets_channel_status on copy_assets(channel, status);
create index idx_copy_assets_status on copy_assets(status);

create trigger copy_assets_set_updated_at
before update on copy_assets
for each row execute function set_updated_at();
