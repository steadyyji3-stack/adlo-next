-- Track B S2: persist the existing Track A StoreProfile contract for paid customers.

create table customer_store_profiles (
  customer_id uuid primary key references customers(id) on delete cascade,
  profile jsonb not null
    check (jsonb_typeof(profile) = 'object')
    check (profile ? 'storeName')
    check (profile ? 'industry')
    check (profile ? 'selectedTags')
    check (profile ? 'savedAt'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customer_store_profiles_industry
  on customer_store_profiles ((profile ->> 'industry'));

create trigger customer_store_profiles_set_updated_at
before update on customer_store_profiles
for each row execute function set_updated_at();
