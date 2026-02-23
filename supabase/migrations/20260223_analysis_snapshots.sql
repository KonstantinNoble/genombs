-- Score History: analysis_snapshots table
-- Stores a lightweight snapshot of each completed analysis for score tracking over time.

create table public.analysis_snapshots (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  url             text not null,
  hostname        text not null,
  overall_score   int not null,
  category_scores jsonb not null,
  scanned_at      timestamptz not null default now()
);

-- Fast per-user + per-domain lookups ordered by date
create index idx_snapshots_user_host_date
  on public.analysis_snapshots (user_id, hostname, scanned_at desc);

-- RLS: users can only read their own snapshots
alter table public.analysis_snapshots enable row level security;

create policy "Users can read own snapshots"
  on public.analysis_snapshots for select
  using (auth.uid() = user_id);
