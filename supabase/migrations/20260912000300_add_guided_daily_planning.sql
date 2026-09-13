-- La planificación guiada conserva las actividades y objetivos como entidades propias.
-- El texto fuente nunca se persiste: solo se guardan los campos confirmados por la persona.

alter table public.daily_plans
  add column recovery_activity text check (recovery_activity is null or char_length(recovery_activity) <= 500),
  add column responsibilities text check (responsibilities is null or char_length(responsibilities) <= 1000),
  add column family_connection text check (family_connection is null or char_length(family_connection) <= 500),
  add column main_risk text check (main_risk is null or char_length(main_risk) <= 600),
  add column risk_strategy text check (risk_strategy is null or char_length(risk_strategy) <= 600);

-- Mantiene toda la operación atómica: o se crea el plan completo, o no se inserta nada.
-- SECURITY INVOKER hace que RLS se aplique con la identidad de quien llama.
create or replace function public.create_daily_plan_with_content(
  p_date date,
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
  new_plan public.daily_plans;
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

  insert into public.daily_plans (
    user_id,
    date,
    wake_up_time,
    recovery_activity,
    responsibilities,
    family_connection,
    main_risk,
    risk_strategy,
    daily_commitment,
    notes
  ) values (
    actor_id,
    p_date,
    p_wake_up_time,
    nullif(btrim(p_recovery_activity), ''),
    nullif(btrim(p_responsibilities), ''),
    nullif(btrim(p_family_connection), ''),
    nullif(btrim(p_main_risk), ''),
    nullif(btrim(p_risk_strategy), ''),
    nullif(btrim(p_daily_commitment), ''),
    nullif(btrim(p_notes), '')
  ) returning * into new_plan;

  for goal_value in select value from jsonb_array_elements(p_goals)
  loop
    insert into public.daily_goals (user_id, daily_plan_id, title, position)
    values (actor_id, new_plan.id, btrim(goal_value ->> 'title'), goal_position);
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
      new_plan.id,
      btrim(activity_value ->> 'title'),
      nullif(btrim(activity_value ->> 'description'), ''),
      coalesce(nullif(activity_value ->> 'category', ''), 'personal'),
      nullif(activity_value ->> 'start_at', '')::timestamptz,
      nullif(activity_value ->> 'end_at', '')::timestamptz,
      coalesce(nullif(activity_value ->> 'priority', ''), 'normal'),
      coalesce(nullif(activity_value ->> 'status', ''), 'pending')
    );
  end loop;

  return new_plan;
end;
$$;

revoke all on function public.create_daily_plan_with_content(date, time, text, text, text, text, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.create_daily_plan_with_content(date, time, text, text, text, text, text, text, text, jsonb, jsonb) to authenticated;