-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- Adds country/region to scholarships and the "who opened which scholarship" table. Safe to run more than once.
alter table public.scholarships add column if not exists country text not null default 'Australia';
alter table public.scholarships add column if not exists region  text not null default 'oceania';

create table if not exists public.clicks (
  id               uuid primary key default gen_random_uuid(),
  subscriber_id    uuid references public.subscribers(id) on delete cascade,
  scholarship_id   text not null,
  scholarship_name text not null,
  university       text not null,
  country          text,
  url              text not null,
  created_at       timestamptz not null default now()
);
create index if not exists clicks_created_at_idx on public.clicks (created_at desc);
alter table public.clicks enable row level security;
