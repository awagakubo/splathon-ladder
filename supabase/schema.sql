-- Schema for tourney-rate
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  name text not null,
  members text[] not null check (cardinality(members) = 4),
  rating numeric not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.rating_history (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  round int not null,
  rating numeric not null,
  note text,
  created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
alter table public.events enable row level security;
alter table public.teams enable row level security;
alter table public.rating_history enable row level security;

-- Read for anon (public) on teams and events
create policy if not exists "Public read events" on public.events for select using (true);
create policy if not exists "Public read teams" on public.teams for select using (true);
create policy if not exists "Public read rating_history" on public.rating_history for select using (true);

-- No write access for anon by default; service_role bypasses RLS and is used by the server
-- You may later add authenticated user policies for admins.

