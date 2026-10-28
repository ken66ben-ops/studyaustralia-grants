-- StudyAustralia Grants database setup.
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

create extension if not exists pgcrypto;

-- Blog posts and short updates written in /admin
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  kind        text not null default 'update' check (kind in ('blog', 'update')),
  title       text not null,
  summary     text,
  body        text not null,
  image_url   text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Scholarships added by hand in /admin (the weekly list stays in data/scholarships.json)
create table if not exists public.scholarships (
  id            uuid primary key default gen_random_uuid(),
  university    text not null,
  name          text not null,
  amount        text not null,
  level         text not null,
  field         text not null default 'All fields',
  eligibility   text not null,
  international boolean not null default true,
  opens         date,
  closes        date not null,
  url           text not null,
  notes         text,
  created_at    timestamptz not null default now()
);

-- People who signed up for alerts
create table if not exists public.subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  name              text,
  interests         text[] not null default '{}',
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at   timestamptz,
  created_at        timestamptz not null default now()
);

-- A record of every alert email sent
create table if not exists public.alerts (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null,
  body        text not null,
  sent_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Lock every table. Only the website's server (using the secret service-role key)
-- can read or write. Visitors' browsers can never read the subscriber list.
alter table public.posts        enable row level security;
alter table public.scholarships enable row level security;
alter table public.subscribers  enable row level security;
alter table public.alerts       enable row level security;

-- Public picture storage for blog images
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
