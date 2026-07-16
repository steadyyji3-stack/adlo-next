-- Track B S3: saved weekly content generated from the paid customer's store profile.

create table customer_content_bundles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  week_start date not null,
  profile_snapshot jsonb not null check (jsonb_typeof(profile_snapshot) = 'object'),
  gbp_posts jsonb not null
    check (jsonb_typeof(gbp_posts) = 'array')
    check (jsonb_array_length(gbp_posts) = 7),
  line_broadcasts jsonb not null
    check (jsonb_typeof(line_broadcasts) = 'array')
    check (jsonb_array_length(line_broadcasts) = 7),
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, week_start)
);

create index idx_customer_content_bundles_history
  on customer_content_bundles (customer_id, week_start desc);

create trigger customer_content_bundles_set_updated_at
before update on customer_content_bundles
for each row execute function set_updated_at();
