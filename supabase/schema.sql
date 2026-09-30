-- Run in the Supabase SQL editor.

-- Per-user JSON collections (applications, stories, sessions, practice)
create table if not exists user_data (
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  value jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table user_data enable row level security;
create policy "own rows" on user_data for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Plan + Stripe link. Users can read their own row; only the service role writes.
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "read own profile" on profiles for select using (auth.uid() = id);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Monthly interview usage
create table if not exists usage (
  user_id uuid not null references auth.users on delete cascade,
  period text not null,
  interviews int not null default 0,
  primary key (user_id, period)
);
alter table usage enable row level security;
create policy "read own usage" on usage for select using (auth.uid() = user_id);

-- Atomically consume one interview; returns false when the free limit is reached.
create or replace function consume_interview(p_uid uuid, p_period text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_plan text; v_count int;
begin
  select plan into v_plan from profiles where id = p_uid;
  if v_plan = 'pro' then return true; end if;
  insert into usage (user_id, period, interviews) values (p_uid, p_period, 0)
    on conflict do nothing;
  update usage set interviews = interviews + 1
    where user_id = p_uid and period = p_period and interviews < p_limit
    returning interviews into v_count;
  return v_count is not null;
end $$;
revoke execute on function consume_interview(uuid, text, int) from public, anon, authenticated;
