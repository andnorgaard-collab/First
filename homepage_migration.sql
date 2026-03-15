-- ═══════════════════════════════════════════════════════════════════════════
-- CoffeeBuddies — Homepage migration
-- Kør dette i Supabase SQL Editor
-- Tilføjer: top_kaffe_maaned() — trending kaffe de seneste 30 dage
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function top_kaffe_maaned(limit_n int default 5)
returns table(
  navn           text,
  oprindelse     text,
  brygmetode     text,
  risteringsgrad text,
  avg_score      numeric,
  antal          bigint,
  din_score      integer
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
    round(avg(cr.samlet_score)::numeric, 1)                          as avg_score,
    count(distinct cr.user_id)                                       as antal,
    max(case when cr.user_id = auth.uid() then cr.samlet_score end)  as din_score
  from coffee_ratings cr
  where cr.dato >= (now() - interval '30 days')::date
  group by cr.navn, cr.oprindelse, cr.brygmetode, cr.risteringsgrad
  order by avg_score desc, antal desc
  limit limit_n;
$$;

grant execute on function top_kaffe_maaned(int) to authenticated;
