-- Kaffeklub: Feed RLS fix
-- Kør dette i Supabase SQL Editor


-- 1. Profiles: tillad at se profiler på brugere man følger
create policy "Brugere kan se profiler for dem de foelger"
  on profiles for select to authenticated
  using (
    auth.uid() = id
    or exists (
      select 1 from follows
      where follower_id = auth.uid()
      and following_id = id
    )
  );


-- 2. Coffee_ratings: tillad at se vurderinger fra brugere man følger
create policy "Brugere kan se kaffer fra dem de foelger"
  on coffee_ratings for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from follows
      where follower_id = auth.uid()
      and following_id = user_id
    )
  );


-- 3. Funktion til at hente feed
create or replace function hent_foelgers_kaffer(limit_n int default 50)
returns table(
  id text,
  username text,
  navn text,
  oprindelse text,
  brygmetode text,
  risteringsgrad text,
  smag jsonb,
  samlet_score integer,
  noter text,
  dato timestamptz
)
language sql stable
as $func$
  select
    id,
    p.username,
    navn,
    oprindelse,
    brygmetode,
    risteringsgrad,
    smag,
    samlet_score,
    noter,
    dato
  from coffee_ratings
  join (select username, id as join_id from profiles) p
    on coffee_ratings.user_id = p.join_id
  where coffee_ratings.user_id in (
    select following_id from follows where follower_id = auth.uid()
  )
  order by dato desc
  limit limit_n;
$func$;

grant execute on function hent_foelgers_kaffer(int) to authenticated;
