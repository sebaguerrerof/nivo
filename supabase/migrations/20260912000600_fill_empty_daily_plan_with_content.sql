-- Permite recuperar un plan vacío con el asistente, sin sobrescribir planes
-- que ya tengan actividades u objetivos.

create or replace function public.fill_empty_daily_plan_with_content(
  p_plan_id uuid,
  p_wake_up_time time,
  p_recovery_activity text,
  p_responsibilities text,
  p_family_connection text,
  p_main_risk text,
  p_risk_strategy text,
  p_daily_commitment text,
  p_notes text,
  p_goals jsonb,
  p_activities jsonb
)
returns public.daily_plans
language plpgsql
security invoker
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_plan public.daily_plans;
  goal_value jsonb;
  activity_value jsonb;
  goal_position integer := 0;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  if p_goals is null or jsonb_typeof(p_goals) <> 'array' or jsonb_array_length(p_goals) > 3 then
    raise exception 'A daily plan can have at most three goals' using errcode = '23514';
  end if;

  if p_activities is null or jsonb_typeof(p_activities) <> 'array' or jsonb_array_length(p_activities) > 30 then
    raise exception 'A daily plan can have at most thirty activities' using errcode = '23514';
  end if;

  select * into existing_plan
  from public.daily_plans
  where id = p_plan_id and user_id = actor_id
  for update;

  if not found then
    raise exception 'Daily plan was not found' using errcode = 'P0002';
  end if;

  if existing_plan.closed_at is not null
    or existing_plan.wake_up_time is not null
    or existing_plan.recovery_activity is not null
    or existing_plan.responsibilities is not null
    or existing_plan.family_connection is not null
    or existing_plan.main_risk is not null
    or existing_plan.risk_strategy is not null
    or existing_plan.daily_commitment is not null
    or existing_plan.notes is not null
    or exists (select 1 from public.daily_goals where daily_plan_id = p_plan_id)
    or exists (select 1 from public.activities where daily_plan_id = p_plan_id) then
    raise exception 'Only an empty daily plan can be filled from a draft' using errcode = '23514';
  end if;

  update public.daily_plans
  set
    wake_up_time = p_wake_up_time,
    recovery_activity = nullif(btrim(p_recovery_activity), ''),
    responsibilities = nullif(btrim(p_responsibilities), ''),
    family_connection = nullif(btrim(p_family_connection), ''),
    main_risk = nullif(btrim(p_main_risk), ''),
    risk_strategy = nullif(btrim(p_risk_strategy), ''),
    daily_commitment = nullif(btrim(p_daily_commitment), ''),
    notes = nullif(btrim(p_notes), '')
  where id = p_plan_id and user_id = actor_id
  returning * into existing_plan;

  for goal_value in select value from jsonb_array_elements(p_goals)
  loop
    insert into public.daily_goals (user_id, daily_plan_id, title, position)
    values (actor_id, p_plan_id, btrim(goal_value ->> 'title'), goal_position);
    goal_position := goal_position + 1;
  end loop;

  for activity_value in select value from jsonb_array_elements(p_activities)
  loop
    insert into public.activities (
      user_id,
      daily_plan_id,
      title,
      description,
      category,
      start_at,
      end_at,
      priority,
      status
    ) values (
      actor_id,
      p_plan_id,
      btrim(activity_value ->> 'title'),
      nullif(btrim(activity_value ->> 'description'), ''),
      coalesce(nullif(activity_value ->> 'category', ''), 'personal'),
      nullif(activity_value ->> 'start_at', '')::timestamptz,
      nullif(activity_value ->> 'end_at', '')::timestamptz,
      coalesce(nullif(activity_value ->> 'priority', ''), 'normal'),
      coalesce(nullif(activity_value ->> 'status', ''), 'pending')
    );
  end loop;

  return existing_plan;
end;
$$;

revoke all on function public.fill_empty_daily_plan_with_content(uuid, time, text, text, text, text, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.fill_empty_daily_plan_with_content(uuid, time, text, text, text, text, text, text, text, jsonb, jsonb) to authenticated;
