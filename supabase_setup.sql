-- GrindrBros — Supabase opsætning
-- Kør dette i Supabase SQL Editor

-- Brugerprofiler
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now()
);

-- Kaffevurderinger
create table if not exists coffee_ratings (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  navn text not null,
  oprindelse text default '',
  risteringsgrad text default 'Medium',
  brygmetode text default 'Filterkaffe',
  vurderede_af text default '',
  smag jsonb not null,
  samlet_score integer not null check (samlet_score between 1 and 10),
  noter text default '',
  dato timestamptz not null,
  created_at timestamptz default now()
);

-- Row Level Security (brugere kan kun se egne data)
alter table profiles enable row level security;
alter table coffee_ratings enable row level security;

create policy "Brugere kan se egen profil"
  on profiles for select using (auth.uid() = id);

create policy "Brugere kan oprette profil"
  on profiles for insert with check (auth.uid() = id);

create policy "Brugere kan opdatere profil"
  on profiles for update using (auth.uid() = id);

create policy "Brugere kan se egne vurderinger"
  on coffee_ratings for select using (auth.uid() = user_id);

create policy "Brugere kan oprette vurderinger"
  on coffee_ratings for insert with check (auth.uid() = user_id);

create policy "Brugere kan opdatere egne vurderinger"
  on coffee_ratings for update using (auth.uid() = user_id);

create policy "Brugere kan slette egne vurderinger"
  on coffee_ratings for delete using (auth.uid() = user_id);
