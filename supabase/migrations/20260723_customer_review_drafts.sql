-- Track B: paid customer review-reply workspace history.
-- Customer access is mediated by Auth.js server routes; no Data API policy is granted.

create table if not exists customer_review_drafts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  reviewer_name text check (reviewer_name is null or char_length(reviewer_name) <= 100),
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 5 and 2000),
  owner_note text check (owner_note is null or char_length(owner_note) <= 500),
  industry text check (industry is null or char_length(industry) <= 80),
  selected_reply text not null check (char_length(selected_reply) between 4 and 2000),
  reply_variants jsonb not null check (jsonb_typeof(reply_variants) = 'array'),
  tips jsonb not null default '[]'::jsonb check (jsonb_typeof(tips) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'copied')),
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_review_drafts_history
  on customer_review_drafts (customer_id, generated_at desc);

drop trigger if exists customer_review_drafts_set_updated_at on customer_review_drafts;
create trigger customer_review_drafts_set_updated_at
before update on customer_review_drafts
for each row execute function set_updated_at();

alter table customer_review_drafts enable row level security;
