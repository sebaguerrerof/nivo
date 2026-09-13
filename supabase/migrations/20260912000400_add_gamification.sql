-- Fase 3: gamificación segura e idempotente.
-- Los eventos se generan solo en triggers confiables; el cliente no puede
-- escribir XP, score ni logros directamente.

alter table public.daily_plans
  add column daily_score integer not null default 0 check (daily_score between 0 and 100);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (char_length(btrim(event_type)) between 1 and 80),
  source_type text not null check (char_length(btrim(source_type)) between 1 and 80),
  source_id uuid not null,
  xp integer not null check (xp <> 0 and xp between -10000 and 10000),
  description text not null check (char_length(btrim(description)) between 1 and 280),
  created_at timestamptz not null default now(),
  constraint xp_events_user_source_event_key unique (user_id, event_type, source_type, source_id)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]+$'),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text not null check (char_length(btrim(description)) between 1 and 280),
  icon text,
  condition_type text not null check (char_length(btrim(condition_type)) between 1 and 80),
  condition_value jsonb not null default '{}'::jsonb,
  xp_bonus integer not null default 0 check (xp_bonus between 0 and 10000),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  constraint user_achievements_user_achievement_key unique (user_id, achievement_id)
);

create index xp_events_user_created_at_index on public.xp_events (user_id, created_at desc);
create index xp_events_user_event_type_index on public.xp_events (user_id, event_type);
create index user_achievements_user_unlocked_at_index on public.user_achievements (user_id, unlocked_at desc);

create or replace function public.calculate_daily_score(p_plan_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_total integer := 0;
  activity_completed integer := 0;
  goal_total integer := 0;
  goal_completed integer := 0;
  is_closed boolean := false;
  total_weight numeric := 0;
  weighted_score numeric := 0;
begin
  select closed_at is not null
  into is_closed
  from public.daily_plans
  where id = p_plan_id;

  if not found then
    return 0;
  end if;

  select count(*), count(*) filter (where status = 'completed')
  into activity_total, activity_completed
  from public.activities
  where daily_plan_id = p_plan_id;

  select count(*), count(*) filter (where completed)
  into goal_total, goal_completed
  from public.daily_goals
  where daily_plan_id = p_plan_id;

  -- Sin actividades ni objetivos no existe material suficiente para puntuar.
  if activity_total = 0 and goal_total = 0 then
    return 0;
  end if;

  -- Las categorías ausentes redistribuyen su peso, pero cerrar el día sigue
  -- siendo parte del compromiso cuando sí hay trabajo planificado.
  if activity_total > 0 then
    total_weight := total_weight + 50;
    weighted_score := weighted_score + (activity_completed::numeric / activity_total) * 50;
  end if;

  if goal_total > 0 then
    total_weight := total_weight + 25;
    weighted_score := weighted_score + (goal_completed::numeric / goal_total) * 25;
  end if;

  total_weight := total_weight + 10;
  if is_closed then
    weighted_score := weighted_score + 10;
  end if;

  return least(100, greatest(0, round((weighted_score / total_weight) * 100)::integer));
end;
$$;

create or replace function public.refresh_daily_plan_score(p_plan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.daily_plans
  set daily_score = public.calculate_daily_score(p_plan_id)
  where id = p_plan_id;
end;
$$;

create or replace function public.refresh_score_from_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_daily_plan_score(old.id);
    return old;
  end if;

  perform public.refresh_daily_plan_score(new.id);
  return new;
end;
$$;

create or replace function public.refresh_score_from_child()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_daily_plan_score(old.daily_plan_id);
    return old;
  end if;

  perform public.refresh_daily_plan_score(new.daily_plan_id);
  return new;
end;
$$;

create or replace function public.evaluate_achievements(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  achievement public.achievements;
  metric integer;
  unlocked_achievement_id uuid;
begin
  for achievement in select * from public.achievements where active loop
    metric := 0;

    if achievement.condition_type = 'activity_completed_count' then
      select count(*) into metric
      from public.xp_events
      where user_id = p_user_id and event_type = 'activity_completed';
    elsif achievement.condition_type = 'daily_plan_count' then
      select count(*) into metric
      from public.daily_plans
      where user_id = p_user_id;
    elsif achievement.condition_type = 'day_closed_count' then
      select count(*) into metric
      from public.xp_events
      where user_id = p_user_id and event_type = 'day_closed';
    end if;

    if metric >= coalesce((achievement.condition_value ->> 'minimum')::integer, 1) then
      insert into public.user_achievements (user_id, achievement_id)
      values (p_user_id, achievement.id)
      on conflict (user_id, achievement_id) do nothing
      returning achievement_id into unlocked_achievement_id;

      if unlocked_achievement_id is not null and achievement.xp_bonus > 0 then
        insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
        values (p_user_id, 'achievement_unlocked', 'achievement', unlocked_achievement_id, achievement.xp_bonus, achievement.name)
        on conflict (user_id, event_type, source_type, source_id) do nothing;
      end if;

      unlocked_achievement_id := null;
    end if;
  end loop;
end;
$$;

create or replace function public.award_xp_from_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward integer;
begin
  if (tg_op = 'INSERT' and new.status = 'completed')
    or (tg_op = 'UPDATE' and old.status is distinct from 'completed' and new.status = 'completed') then
    reward := case when new.priority = 'high' or new.category = 'sport' then 20 else 10 end;

    insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
    values (new.user_id, 'activity_completed', 'activity', new.id, reward, 'Actividad completada')
    on conflict (user_id, event_type, source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.award_xp_from_daily_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
  values (new.user_id, 'daily_plan_created', 'daily_plan', new.id, 15, 'Planificación creada')
  on conflict (user_id, event_type, source_type, source_id) do nothing;
  return new;
end;
$$;

create or replace function public.award_xp_from_day_close()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.closed_at is null and new.closed_at is not null then
    insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
    values (new.user_id, 'day_closed', 'daily_plan', new.id, 15, 'Cierre del día')
    on conflict (user_id, event_type, source_type, source_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.award_xp_from_completed_goals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_id uuid;
  actor_id uuid;
begin
  if tg_op = 'DELETE' then
    plan_id := old.daily_plan_id;
    actor_id := old.user_id;
  else
    plan_id := new.daily_plan_id;
    actor_id := new.user_id;
  end if;

  if exists (select 1 from public.daily_goals where daily_plan_id = plan_id)
    and not exists (select 1 from public.daily_goals where daily_plan_id = plan_id and not completed) then
    insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
    values (actor_id, 'daily_goals_completed', 'daily_plan', plan_id, 30, 'Objetivos diarios completados')
    on conflict (user_id, event_type, source_type, source_id) do nothing;
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.evaluate_achievements_from_xp_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.evaluate_achievements(new.user_id);
  return new;
end;
$$;

drop trigger if exists daily_plans_refresh_score_on_insert on public.daily_plans;
create trigger daily_plans_refresh_score_on_insert
after insert on public.daily_plans
for each row execute procedure public.refresh_score_from_plan();

drop trigger if exists daily_plans_refresh_score_on_close on public.daily_plans;
create trigger daily_plans_refresh_score_on_close
after update of closed_at on public.daily_plans
for each row execute procedure public.refresh_score_from_plan();

drop trigger if exists daily_goals_refresh_score on public.daily_goals;
create trigger daily_goals_refresh_score
after insert or update of completed or delete on public.daily_goals
for each row execute procedure public.refresh_score_from_child();

drop trigger if exists activities_refresh_score on public.activities;
create trigger activities_refresh_score
after insert or update of status or delete on public.activities
for each row execute procedure public.refresh_score_from_child();

drop trigger if exists activities_award_xp on public.activities;
create trigger activities_award_xp
after insert or update of status on public.activities
for each row execute procedure public.award_xp_from_activity();

drop trigger if exists daily_plans_award_xp on public.daily_plans;
create trigger daily_plans_award_xp
after insert on public.daily_plans
for each row execute procedure public.award_xp_from_daily_plan();

drop trigger if exists daily_plans_award_close_xp on public.daily_plans;
create trigger daily_plans_award_close_xp
after update of closed_at on public.daily_plans
for each row execute procedure public.award_xp_from_day_close();

drop trigger if exists daily_goals_award_completion_xp on public.daily_goals;
create trigger daily_goals_award_completion_xp
after insert or update of completed or delete on public.daily_goals
for each row execute procedure public.award_xp_from_completed_goals();

drop trigger if exists xp_events_evaluate_achievements on public.xp_events;
create trigger xp_events_evaluate_achievements
after insert on public.xp_events
for each row execute procedure public.evaluate_achievements_from_xp_event();

insert into public.achievements (code, name, description, icon, condition_type, condition_value, xp_bonus)
values
  ('first_step', 'Primer paso', 'Completa tu primera actividad.', 'sparkles', 'activity_completed_count', '{"minimum": 1}'::jsonb, 20),
  ('first_closure', 'Día cerrado', 'Completa tu primer cierre de día.', 'check-circle', 'day_closed_count', '{"minimum": 1}'::jsonb, 20),
  ('week_planned', 'Semana planificada', 'Crea siete planes diarios.', 'calendar-check', 'daily_plan_count', '{"minimum": 7}'::jsonb, 50),
  ('discipline_50', 'Disciplina', 'Completa 50 actividades.', 'target', 'activity_completed_count', '{"minimum": 50}'::jsonb, 100)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  condition_type = excluded.condition_type,
  condition_value = excluded.condition_value,
  xp_bonus = excluded.xp_bonus;

-- Da reconocimiento a datos creados antes de activar la Fase 3.
insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description, created_at)
select user_id, 'daily_plan_created', 'daily_plan', id, 15, 'Planificación creada', created_at
from public.daily_plans
on conflict (user_id, event_type, source_type, source_id) do nothing;

insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description, created_at)
select user_id, 'activity_completed', 'activity', id,
  case when priority = 'high' or category = 'sport' then 20 else 10 end,
  'Actividad completada', coalesce(completed_at, updated_at, created_at)
from public.activities
where status = 'completed'
on conflict (user_id, event_type, source_type, source_id) do nothing;

insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description, created_at)
select user_id, 'day_closed', 'daily_plan', id, 15, 'Cierre del día', closed_at
from public.daily_plans
where closed_at is not null
on conflict (user_id, event_type, source_type, source_id) do nothing;

insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
select plan.user_id, 'daily_goals_completed', 'daily_plan', plan.id, 30, 'Objetivos diarios completados'
from public.daily_plans plan
where exists (select 1 from public.daily_goals goal where goal.daily_plan_id = plan.id)
  and not exists (select 1 from public.daily_goals goal where goal.daily_plan_id = plan.id and not goal.completed)
on conflict (user_id, event_type, source_type, source_id) do nothing;

update public.daily_plans
set daily_score = public.calculate_daily_score(id);

alter table public.xp_events enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy "xp_events_select_own" on public.xp_events for select to authenticated using (auth.uid() = user_id);
create policy "achievements_select_authenticated" on public.achievements for select to authenticated using (true);
create policy "user_achievements_select_own" on public.user_achievements for select to authenticated using (auth.uid() = user_id);

revoke all on public.xp_events, public.achievements, public.user_achievements from anon, authenticated;
grant select on public.xp_events, public.achievements, public.user_achievements to authenticated;

-- El score es derivado por triggers: el cliente no puede asignarlo arbitrariamente.
revoke update on public.daily_plans from authenticated;
grant update (date, wake_up_time, recovery_activity, responsibilities, family_connection, main_risk, risk_strategy, daily_commitment, notes, closed_at) on public.daily_plans to authenticated;

revoke execute on function public.calculate_daily_score(uuid) from public, anon, authenticated;
revoke execute on function public.refresh_daily_plan_score(uuid) from public, anon, authenticated;
revoke execute on function public.refresh_score_from_plan() from public, anon, authenticated;
revoke execute on function public.refresh_score_from_child() from public, anon, authenticated;
revoke execute on function public.evaluate_achievements(uuid) from public, anon, authenticated;
revoke execute on function public.award_xp_from_activity() from public, anon, authenticated;
revoke execute on function public.award_xp_from_daily_plan() from public, anon, authenticated;
revoke execute on function public.award_xp_from_day_close() from public, anon, authenticated;
revoke execute on function public.award_xp_from_completed_goals() from public, anon, authenticated;
revoke execute on function public.evaluate_achievements_from_xp_event() from public, anon, authenticated;