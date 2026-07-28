-- Track B security boundary: all customer data is server-only.
-- The application uses the Supabase service role after its own session checks;
-- anon and authenticated Data API roles intentionally receive no policies.

alter table customers enable row level security;
alter table subscriptions enable row level security;
alter table onboarding_submissions enable row level security;
alter table gbp_posts enable row level security;
alter table gbp_reviews enable row level security;
alter table keyword_rankings enable row level security;
alter table monthly_reports enable row level security;
alter table ad_spend_daily enable row level security;
alter table audit_log enable row level security;

alter table authjs_users enable row level security;
alter table authjs_accounts enable row level security;
alter table authjs_sessions enable row level security;
alter table authjs_verification_tokens enable row level security;

alter table customer_store_profiles enable row level security;
alter table customer_growth_cycles enable row level security;
