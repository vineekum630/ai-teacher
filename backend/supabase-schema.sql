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