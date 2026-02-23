-- Backfill migration: add hostname column to analysis_snapshots
-- Run this if you already ran the initial migration without the hostname column.

-- Step 1: Add the hostname column if it doesn't exist yet
alter table public.analysis_snapshots
  add column if not exists hostname text;

-- Step 2: Backfill hostname from the existing url values
-- Strips the protocol (https://), www., and any path
update public.analysis_snapshots
set hostname = regexp_replace(
  regexp_replace(url, '^https?://(www\.)?', ''),  -- strip protocol + www.
  '/.*$', ''                                         -- strip path
)
where hostname is null or hostname = '';

-- Step 3: Make hostname NOT NULL going forward (safe after backfill)
alter table public.analysis_snapshots
  alter column hostname set not null;

-- Step 4: Add the compound index if it doesn't exist
create index if not exists idx_snapshots_user_host_date
  on public.analysis_snapshots (user_id, hostname, scanned_at desc);
