-- Track A `/check` 伺服器端分數快照。
--
-- 為什麼存在：/check 目前只把歷史存在瀏覽器 localStorage，Track B 的付費
-- 後台無法在伺服器端讀取。本表是 docs/api/track-a-check-history-contract.md
-- 定義的唯一資料源；Track B 唯讀消費，不得建立第二套分數表。
--
-- 隱私：不存 email、不存 IP、不存 Google 授權憑證。店家名稱與地區僅以
-- 正規化形式存在 check_store_profiles，用於產生穩定的 opaque key。

-- ── 1. 店家身分（opaque key 的來源）────────────────────────────────
-- store_profile_key 是隨機 UUID，不由店名推導，因此不可被反推或猜測。
-- normalized_name / normalized_location 僅供「同一家店回訪時取得同一把 key」。
create table if not exists check_store_profiles (
  store_profile_key   uuid primary key default gen_random_uuid(),
  normalized_name     text not null,
  normalized_location text not null,
  created_at          timestamptz not null default now(),
  last_seen_at        timestamptz not null default now(),
  unique (normalized_name, normalized_location)
);

create index if not exists idx_check_store_profiles_lookup
  on check_store_profiles (normalized_name, normalized_location);

-- ── 2. 分數快照 ────────────────────────────────────────────────────
-- dimensions 以 jsonb 存放，欄位對應契約的 CheckHistorySnapshot.dimensions。
-- 目前 /check 產出 6 個維度；契約的 content 維度尚未實作，一律寫 null。
create table if not exists check_snapshots (
  id                 uuid primary key default gen_random_uuid(),
  store_profile_key  uuid not null references check_store_profiles(store_profile_key) on delete cascade,
  checked_at         timestamptz not null default now(),
  overall_score      smallint not null check (overall_score between 0 and 100),
  dimensions         jsonb not null check (jsonb_typeof(dimensions) = 'object'),
  -- 計分邏輯版本。變更計分方式時必須遞增，Track B 只比較相同 sourceVersion。
  source_version     text not null default 'check-v1',
  created_at         timestamptz not null default now()
);

-- Track B 讀取模式：依 key 取最新 N 筆
create index if not exists idx_check_snapshots_by_profile
  on check_snapshots (store_profile_key, checked_at desc);

-- ── 3. RLS：server-only，與其餘 Track B 資料表一致 ──────────────────
-- 不授予 anon / authenticated 任何 Data API policy；
-- 所有存取一律經過伺服器端 service role。
alter table check_store_profiles enable row level security;
alter table check_snapshots      enable row level security;
