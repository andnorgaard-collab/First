-- ═══════════════════════════════════════════════════════════════════════════
-- CoffeeBuddies — Social v2 migration
-- Kør dette i Supabase SQL Editor
-- Tilføjer: direkte delinger til specifikke brugere + highscore-funktion
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Tilføj to_user_id kolonne til shared_ratings
--    NULL = del med alle følgere (broadcast)
--    UUID = send kun til denne specifikke bruger
-- ─────────────────────────────────────────────────────────────────────────────
alter table shared_ratings
  add column if not exists to_user_id uuid references auth.users(id) on delete cascade;

create index if not exists shared_ratings_to_user_idx on shared_ratings(to_user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Fjern gammel unique constraint (fungerer ikke korrekt med nullable kolonne)
-- ─────────────────────────────────────────────────────────────────────────────
alter table shared_ratings drop constraint if exists unik_deling;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Opdater RLS-politik til at inkludere direkte delinger
--    Brugere kan se:
--      - Egne delinger
--      - Broadcasts (to_user_id IS NULL) fra folk de følger
--      - Delinger specifikt til dem (to_user_id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "Brugere kan se relevante delinger" on shared_ratings;

create policy "Brugere kan se relevante delinger"
  on shared_ratings for select to authenticated
  using (
    from_user_id = auth.uid()
    or to_user_id = auth.uid()
    or (
      to_user_id is null
      and exists (
        select 1 from follows
        where follower_id  = auth.uid()
          and following_id = shared_ratings.from_user_id
      )
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Highscore-funktion: Top kaffer baseret på delte vurderinger
--    Bruger security definer så den kan aggregere på tværs af brugere
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function top_kaffe_highscore(limit_n int default 10)
returns table(
  navn          text,
  oprindelse    text,
  brygmetode    text,
  risteringsgrad text,
  avg_score     numeric,
  antal         bigint
)
language sql
security definer
stable
as $$
  select
    cr.navn,
    cr.oprindelse,
    cr.brygmetode,
    cr.risteringsgrad,
    round(avg(cr.samlet_score)::numeric, 1) as avg_score,
    count(distinct cr.user_id)              as antal
  from shared_ratings sr
  join coffee_ratings  cr on cr.id = sr.rating_id
  where sr.to_user_id is null   -- kun offentlige broadcasts tæller med
  group by cr.navn, cr.oprindelse, cr.brygmetode, cr.risteringsgrad
  order by avg_score desc, antal desc
  limit limit_n;
$$;

-- Giv autentificerede brugere adgang til at kalde funktionen
grant execute on function top_kaffe_highscore(int) to authenticated;
