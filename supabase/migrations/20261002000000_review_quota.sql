-- Weekly free allowance for statement/answer reviews. period holds an ISO week such as '2026-W40'.
alter table usage add column if not exists reviews int not null default 0;

create or replace function consume_review(p_uid uuid, p_period text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_plan text; v_count int;
begin
  select plan into v_plan from profiles where id = p_uid;
  if v_plan = 'pro' then return true; end if;
  insert into usage (user_id, period, interviews, reviews) values (p_uid, p_period, 0, 0)
    on conflict do nothing;
  update usage set reviews = reviews + 1
    where user_id = p_uid and period = p_period and reviews < p_limit
    returning reviews into v_count;
  return v_count is not null;
end $$;
revoke execute on function consume_review(uuid, text, int) from public, anon, authenticated;
