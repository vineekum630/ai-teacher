create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('teacher', 'student')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  grade text not null,
  subject text not null,
  topic text not null,
  skill text not null,
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0 and correct <= attempts),
  mastery_status text not null default 'developing' check (mastery_status in ('starting', 'developing', 'ready')),
  updated_at timestamptz not null default now(),
  unique (user_id, grade, subject, topic, skill)
);

alter table public.learning_progress enable row level security;