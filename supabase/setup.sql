-- ============================================================
-- VISITOR TRACKING SYSTEM - Supabase Setup
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- 1. Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";


-- ============================================================
-- 2. VISITS TABLE
-- Records every page visit
-- ============================================================
create table if not exists visits (
  id          uuid        primary key default uuid_generate_v4(),
  page        text        not null,
  timestamp   timestamptz not null default now(),
  user_agent  text,
  ip_address  text,
  session_id  text        not null,
  referrer    text
);

-- Indexes for fast aggregation queries
create index if not exists visits_timestamp_idx  on visits (timestamp desc);
create index if not exists visits_session_id_idx on visits (session_id);
create index if not exists visits_page_idx       on visits (page);


-- ============================================================
-- 3. ACTIVE USERS TABLE
-- Tracks live sessions via heartbeat (upsert every 30s)
-- Rows with last_seen older than 2 minutes = inactive
-- ============================================================
create table if not exists active_users (
  id          uuid        primary key default uuid_generate_v4(),
  session_id  text        unique not null,
  last_seen   timestamptz not null default now()
);

create index if not exists active_users_last_seen_idx on active_users (last_seen desc);


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- Allows anon key inserts from the frontend while keeping data readable
-- In a production app you'd restrict reads to authenticated admins only
-- ============================================================
alter table visits       enable row level security;
alter table active_users enable row level security;

-- visits: anon can INSERT and SELECT
drop policy if exists "anon_insert_visits"  on visits;
drop policy if exists "anon_select_visits"  on visits;
create policy "anon_insert_visits" on visits for insert to anon with check (true);
create policy "anon_select_visits" on visits for select to anon using (true);

-- active_users: anon can INSERT, UPDATE, SELECT
drop policy if exists "anon_insert_active_users" on active_users;
drop policy if exists "anon_update_active_users" on active_users;
drop policy if exists "anon_select_active_users" on active_users;
create policy "anon_insert_active_users" on active_users for insert to anon with check (true);
create policy "anon_update_active_users" on active_users for update to anon using (true);
create policy "anon_select_active_users" on active_users for select to anon using (true);


-- ============================================================
-- 5. CLEANUP FUNCTION
-- Removes stale active_users rows older than 2 minutes.
-- Call this via a Supabase pg_cron job or from your backend.
-- Example cron (pg_cron extension): SELECT cron.schedule('cleanup-active-users', '* * * * *', 'SELECT cleanup_active_users()');
-- ============================================================
create or replace function cleanup_active_users()
returns void
language plpgsql
as $$
begin
  delete from active_users
  where last_seen < now() - interval '2 minutes';
end;
$$;


-- ============================================================
-- 6. REALTIME (enable for active_users so the dashboard updates live)
-- Run these to enable Realtime on both tables in Supabase:
--   Dashboard → Database → Replication → enable for "active_users"
-- Or run the statements below:
-- ============================================================
-- alter publication supabase_realtime add table active_users;
-- alter publication supabase_realtime add table visits;
