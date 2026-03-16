-- ═══════════════════════════════════════════════════════════════════════════
-- CoffeeBuddies — Image migration
-- Kør dette i Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Tilføj image_url kolonne til coffee_ratings
alter table coffee_ratings
  add column if not exists image_url text default null;

-- 2. Opret Storage-bucket til kaffe-billeder
insert into storage.buckets (id, name, public)
values ('coffee-images', 'coffee-images', true)
on conflict (id) do nothing;

-- 3. RLS-politikker for Storage
-- Alle autentificerede brugere kan se billeder (public bucket)
create policy "Alle kan se kaffe-billeder"
  on storage.objects for select
  using (bucket_id = 'coffee-images');

-- Brugere kan kun uploade til deres eget "mappe" (userId/ratingId.jpg)
create policy "Brugere kan uploade egne billeder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'coffee-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Brugere kan kun opdatere egne billeder
create policy "Brugere kan opdatere egne billeder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'coffee-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Brugere kan kun slette egne billeder
create policy "Brugere kan slette egne billeder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'coffee-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
