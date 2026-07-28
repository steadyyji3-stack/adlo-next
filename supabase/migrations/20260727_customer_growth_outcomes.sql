-- Track B outcome evidence: separate task execution from observed improvement.

alter table customer_growth_cycles
  add column if not exists baseline_snapshot jsonb null
    check (baseline_snapshot is null or jsonb_typeof(baseline_snapshot) = 'object'),
  add column if not exists result_snapshot jsonb null
    check (result_snapshot is null or jsonb_typeof(result_snapshot) = 'object'),
  add column if not exists outcome_status text null
    check (outcome_status is null or outcome_status in (
      'action_verified',
      'verified_improvement',
      'verified_no_change',
      'verified_regression'
    )),
  add column if not exists confidence_level text null
    check (confidence_level is null or confidence_level in ('low', 'medium', 'high')),
  add column if not exists next_recommendation jsonb null
    check (next_recommendation is null or jsonb_typeof(next_recommendation) = 'object');

create index if not exists idx_customer_growth_cycles_outcomes
  on customer_growth_cycles (customer_id, outcome_status, week_start desc)
  where outcome_status is not null;
