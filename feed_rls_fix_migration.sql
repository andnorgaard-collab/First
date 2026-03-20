-- ═══════════════════════════════════════════════════════════════════════════
-- Kaffeklub — Feed RLS fix migration
-- Kør dette i Supabase SQL Editor
-- Tilføjer: RLS-politikker der tillader læsning af data fra brugere man følger
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES: tillad at se profiler på brugere man følger
--    (nødvendigt for username-opslag i feed)
-- ─────────────────────────────────────────────────────────────────────────────
create policy "Brugere kan se profiler for dem de følger"
  on profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from follows
      where follower_id  = auth.uid()
        and following_id = profiles.id
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. COFFEE_RATINGS: tillad at se vurderinger fra brugere man følger
-- ─────────────────────────────────────────────────────────────────────────────
create policy "Brugere kan se kaffer fra dem de følger"
  on coffee_ratings for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from follows
      where follower_id  = auth.uid()
        and following_id = coffee_ratings.user_id
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Opdater hent_foelgers_kaffer uden security definer
--    (RLS håndterer nu adgangen korrekt)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function hent_foelgers_kaffer(limit_n int default 50)
returns table(
  id             text,
  username       text,
  navn           text,
  oprindelse     text,
  brygmetode     text,
  risteringsgrad text,
  smag           jsonb,
  samlet_score   integer,
  noter          text,
  dato           timestamptz
)
language sql
stable
as $$
  select
    cr.id,
    p.username,
    cr.navn,
    cr.oprindelse,
    cr.brygmetode,
    cr.risteringsgrad,
    cr.smag,
    cr.samlet_score,
    cr.noter,
    cr.dato
  from coffee_ratings cr
  join profiles p on p.id = cr.user_id
  where cr.user_id in (
    select following_id
    from follows
    where follower_id = auth.uid()
  )
  order by cr.dato desc
  limit limit_n;
$$;

grant execute on function hent_foelgers_kaffer(int) to authenticated;
