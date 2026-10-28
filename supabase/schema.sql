-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create table if not exists audit_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  requested_url text not null,
  vertical text,
  city text,
  vertical_inferred boolean not null default false,
  city_inferred boolean not null default false,
  business_name text,
  page_load_error text,
  checklist jsonb not null default '[]',
  hook_issue jsonb,
  seo_fixes jsonb not null default '[]',
  mockup_html text,
  before_after jsonb not null default '[]',
  outreach_line text,
  fail_count integer not null default 0,
  priority text check (priority in ('high', 'medium', 'low')),
  skip_recommended boolean not null default false,
  raw_model_output jsonb
);

alter table audit_runs enable row level security;

-- Server-side API route uses the service role key, which bypasses RLS,
-- so no policy is required for inserts from the backend. This policy
-- only allows anonymous/public read access, in case you want a client
-- component to list past runs directly via the anon key.
create policy "Public read access" on audit_runs
  for select
  using (true);

-- Lightweight feedback widget, inserted directly from the browser with the
-- anon/publishable key. Write-only from the client (no select policy),
-- read it yourself via the Supabase table editor or with the service role key.
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  page text,
  message text not null,
  rating smallint check (rating between 1 and 5)
);

alter table feedback enable row level security;

create policy "Public insert access" on feedback
  for insert
  with check (true);
