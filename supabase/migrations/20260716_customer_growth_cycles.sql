-- Track B core: one evidence-backed growth action per paid customer and Taipei week.

create table customer_growth_cycles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  week_start date not null,
  status text not null default 'ready'
    check (status in ('ready', 'completed')),
  task jsonb not null
    check (jsonb_typeof(task) = 'object'),
  evidence jsonb not null default '[]'::jsonb
    check (jsonb_typeof(evidence) = 'array'),
  profile_snapshot jsonb not null
    check (jsonb_typeof(profile_snapshot) = 'object'),
  generation_source text not null
    check (generation_source in ('groq', 'template')),
  generation_count smallint not null default 1
    check (generation_count between 1 and 4),
  instruction text null
    check (instruction is null or char_length(instruction) <= 300),
  feedback jsonb null
    check (feedback is null or jsonb_typeof(feedback) = 'object'),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, week_start)
);

create index idx_customer_growth_cycles_history
  on customer_growth_cycles (customer_id, week_start desc);

create trigger customer_growth_cycles_set_updated_at
before update on customer_growth_cycles
for each row execute function set_updated_at();
