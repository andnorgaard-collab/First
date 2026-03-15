-- ═══════════════════════════════════════════════════════════════════════════
-- CoffeeBuddies — UAT SQL-fix
-- Kør dette i Supabase SQL Editor efter supabase_setup.sql
-- Dækker: manglende tabeller, sikkerhedspolitikker, GDPR og best practices
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES: tilføj DELETE-politik (GDPR Art. 17 – ret til sletning)
-- ─────────────────────────────────────────────────────────────────────────────
-- Brugere skal kunne anmode om sletning af egne data. Cascade på auth.users
-- fjerner ratings/follows automatisk, men profilen slettes ikke uden denne.
create policy "Brugere kan slette egen profil"
  on profiles for delete using (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PROFILES: længdebegrænsning på brugernavn
-- ─────────────────────────────────────────────────────────────────────────────
-- Forhindrer ekstremt lange brugernavne i databasen (defence-in-depth udover
-- frontend-validering).
alter table profiles
  add constraint username_laengde check (
    char_length(username) between 3 and 30
  );

-- Trim eksisterende data inden constraint tilføjes (kør kun ved behov)
-- update profiles set username = substring(username for 30) where char_length(username) > 30;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. COFFEE_RATINGS: længdebegrænsninger (forhindrer datamisbrug)
-- ─────────────────────────────────────────────────────────────────────────────
alter table coffee_ratings
  add constraint navn_laengde      check (char_length(navn) between 1 and 200),
  add constraint oprindelse_laengde check (char_length(oprindelse) <= 100),
  add constraint boennesort_laengde check (char_length(boennesort) <= 100),
  add constraint noter_laengde      check (char_length(noter) <= 2000),
  add constraint risteringsgrad_vaerdi check (
    risteringsgrad in ('Light','Medium','Dark','Espresso',
                       'Lys','Mørk')        -- bakw. compat med dansk
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. FOLLOWS-tabel
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists follows (
  follower_id  uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  -- Forhindrer self-follow på databaseniveau
  constraint ingen_self_follow check (follower_id <> following_id)
);

alter table follows enable row level security;

-- Alle autentificerede brugere kan se følge-relationer (nødvendigt for feed og søgning)
create policy "Brugere kan se følger-relationer"
  on follows for select to authenticated using (true);

-- Brugere kan kun oprette følge-relationer for sig selv
create policy "Brugere kan følge andre"
  on follows for insert to authenticated
  with check (follower_id = auth.uid());

-- Brugere kan kun slette egne følge-relationer
create policy "Brugere kan afølge"
  on follows for delete to authenticated
  using (follower_id = auth.uid());

-- Performance-indekser
create index if not exists follows_follower_idx  on follows(follower_id);
create index if not exists follows_following_idx on follows(following_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SHARED_RATINGS-tabel
-- ─────────────────────────────────────────────────────────────────────────────
-- OBS: coffee_ratings.id er TEXT (ikke uuid), så rating_id skal også være TEXT.
create table if not exists shared_ratings (
  id           uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  rating_id    text not null references coffee_ratings(id) on delete cascade,
  type         text not null check (type in ('recommend','warn')),
  besked       text,
  created_at   timestamptz default now(),
  -- Forhindrer dublerede delinger af samme vurdering fra samme bruger
  -- (kan fjernes hvis du ønsker at tillade gentagende delinger)
  constraint unik_deling unique (from_user_id, rating_id, type)
);

-- Længdebegrænsning på besked (GDPR: minimer data)
alter table shared_ratings
  add constraint besked_laengde check (char_length(besked) <= 500);

alter table shared_ratings enable row level security;

-- KRITISK SIKKERHEDSFEJL I ORIGINAL:
-- Den oprindelige "read shares"-politik brugte `using (true)`, hvilket
-- betød at ALLE autentificerede brugere kunne læse ALLE delinger via API,
-- uanset om de følger afsenderen.
-- Fix: Brugere må kun se delinger fra folk de følger, eller egne delinger.
create policy "Brugere kan se relevante delinger"
  on shared_ratings for select to authenticated
  using (
    from_user_id = auth.uid()
    or exists (
      select 1 from follows
      where follower_id  = auth.uid()
        and following_id = shared_ratings.from_user_id
    )
  );

create policy "Brugere kan dele egne vurderinger"
  on shared_ratings for insert to authenticated
  with check (from_user_id = auth.uid());

create policy "Brugere kan slette egne delinger"
  on shared_ratings for delete to authenticated
  using (from_user_id = auth.uid());

-- Performance-indekser
create index if not exists shared_ratings_from_user_idx on shared_ratings(from_user_id);
create index if not exists shared_ratings_rating_idx    on shared_ratings(rating_id);
create index if not exists shared_ratings_created_idx   on shared_ratings(created_at desc);

-- Indeks på coffee_ratings for hurtigere bruger-forespørgsler
create index if not exists coffee_ratings_user_dato_idx
  on coffee_ratings(user_id, dato desc);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. GDPR — Data Retention (valgfrit men anbefalet)
-- ─────────────────────────────────────────────────────────────────────────────
-- Opret en audit/gdpr-log tabel til at spore datasletningstidspunkter,
-- så du kan dokumentere overholdelse af sletningsanmodninger.
create table if not exists gdpr_slettelog (
  id          uuid primary key default gen_random_uuid(),
  bruger_id   uuid not null,  -- ikke FK — brugeren er allerede slettet
  slettet_kl  timestamptz not null default now(),
  aarsag      text           -- 'user_request', 'inactivity', etc.
);
alter table gdpr_slettelog enable row level security;
-- Kun service_role kan skrive/læse (ingen bruger-adgang)
-- (Opsæt via Supabase Dashboard under Authentication > Policies)


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FUNKTION: Fuld kontosletning (GDPR Art. 17)
-- ─────────────────────────────────────────────────────────────────────────────
-- Denne funktion sletter alt brugerdata korrekt og logger sletningen.
-- Kald den fra en Supabase Edge Function med service_role-nøgle.
create or replace function slet_bruger_data(bruger_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Log sletningen INDEN data fjernes
  insert into gdpr_slettelog(bruger_id, aarsag)
  values (bruger_uuid, 'user_request');

  -- Cascade håndterer coffee_ratings, follows, shared_ratings automatisk
  -- via on delete cascade på auth.users FK'er.
  -- Vi sletter profilen eksplicit for en sikkerheds skyld:
  delete from profiles where id = bruger_uuid;

  -- Slet auth-bruger (kræver service_role)
  -- Dette trigger cascade-sletning af alle relaterede rækker.
  delete from auth.users where id = bruger_uuid;
end;
$$;

-- Kun service_role kan kalde funktionen
revoke execute on function slet_bruger_data(uuid) from public, anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- RESUME: Hvad dette script fikser
-- ─────────────────────────────────────────────────────────────────────────────
-- [SIKKERHED]
--  ✓ shared_ratings: read-politik ændret fra "alle kan læse alt" til
--    "kun egne + fra folk man følger" — forhindrer API-dataudtræk
--  ✓ follows: self-follow forhindret på DB-niveau
--  ✓ follows: duplicate follow forhindret via primary key
--  ✓ shared_ratings: dubletdeling forhindret via unique constraint
--
-- [GDPR / COMPLIANCE]
--  ✓ profiles: DELETE-politik tilføjet (ret til sletning)
--  ✓ slet_bruger_data(): funktion til komplet kontosletning
--  ✓ gdpr_slettelog: auditspor for sletninger
--  ✓ besked_laengde: 500 tegn max (dataminimering)
--
-- [BEST PRACTICES]
--  ✓ Længdebegrænsninger på username, navn, noter, oprindelse, besked
--  ✓ risteringsgrad check constraint (validerer mod tilladte værdier)
--  ✓ Performance-indekser på follows og shared_ratings
--  ✓ coffee_ratings: indeks på (user_id, dato desc)
--
-- [MANGLENDE TABELLER (i supabase_setup.sql)]
--  ✓ follows — oprettet med fuld RLS
--  ✓ shared_ratings — oprettet med korrekt type (rating_id TEXT)
--    og sikker read-politik
-- ═══════════════════════════════════════════════════════════════════════════
