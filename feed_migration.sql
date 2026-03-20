-- ═══════════════════════════════════════════════════════════════════════════
-- Kaffeklub — Social Feed migration
-- Kør dette i Supabase SQL Editor
-- Tilføjer: funktion til at hente kaffer fra brugere du følger
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- Funktion: hent_foelgers_kaffer
-- Returnerer kaffevurderinger fra alle brugere du følger, sorteret nyeste først.
-- security definer: nødvendigt for at læse andre brugeres coffee_ratings
-- (som ellers er RLS-beskyttet til kun egne data)
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
security definer
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

-- Giv autentificerede brugere adgang til funktionen
grant execute on function hent_foelgers_kaffer(int) to authenticated;
