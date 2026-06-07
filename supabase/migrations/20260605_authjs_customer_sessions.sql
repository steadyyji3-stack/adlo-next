-- Track B5: Auth.js customer magic-link sessions.
-- Uses authjs_* table names to avoid colliding with Supabase Auth's auth schema.

create table if not exists authjs_users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  email_verified timestamptz,
  image text
);

create table if not exists authjs_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references authjs_users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at int,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  oauth_token_secret text,
  oauth_token text,
  unique (provider, provider_account_id)
);

create index if not exists idx_authjs_accounts_user on authjs_accounts(user_id);

create table if not exists authjs_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  user_id uuid not null references authjs_users(id) on delete cascade,
  expires timestamptz not null
);

create index if not exists idx_authjs_sessions_user on authjs_sessions(user_id);
create index if not exists idx_authjs_sessions_expires on authjs_sessions(expires);

create table if not exists authjs_verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

create index if not exists idx_authjs_verification_tokens_expires on authjs_verification_tokens(expires);
