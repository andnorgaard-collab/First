-- Run this in Supabase Dashboard > SQL Editor

create table if not exists app_config (
  key   text primary key,
  value text not null
);

-- Only admins (service_role) can write; authenticated users can read
alter table app_config enable row level security;

create policy "Authenticated users can read app_config"
  on app_config for select
  to authenticated
  using (true);

-- Insert the Anthropic API key (replace with your actual key)
insert into app_config (key, value)
values ('ai_key', 'YOUR_ANTHROPIC_API_KEY_HERE')
on conflict (key) do update set value = excluded.value;
