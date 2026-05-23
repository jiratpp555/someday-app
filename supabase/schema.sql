-- ════════════════════════════════════════════════════════════════
-- Someday App — Supabase Schema
-- รันคำสั่งนี้ใน Supabase SQL Editor หลังสร้าง project
-- ════════════════════════════════════════════════════════════════

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('cafe', 'place', 'product')),
  title text not null,
  subtitle text,
  note text,
  image_url text,
  external_url text,
  price numeric,
  lat double precision,
  lng double precision,
  visited boolean default false,
  visited_at timestamptz,
  rating int check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

create index items_user_idx on public.items (user_id, category);

alter table public.items enable row level security;

create policy "Users see own items" on public.items
  for select using (auth.uid() = user_id);
create policy "Users insert own items" on public.items
  for insert with check (auth.uid() = user_id);
create policy "Users update own items" on public.items
  for update using (auth.uid() = user_id);
create policy "Users delete own items" on public.items
  for delete using (auth.uid() = user_id);
