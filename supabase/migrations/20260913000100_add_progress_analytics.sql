-- Fase 4: progreso personal. Este RPC centraliza las lecturas agregadas para
-- evitar una consulta completa por gráfico. No recibe user_id: la identidad
-- siempre se deriva de auth.uid() y permanece protegida por RLS.

create index if not exists daily_goals_user_plan_index
  on public.daily_goals (user_id, daily_plan_id);

create index if not exists daily_reflections_user_created_at_index
  on public.daily_reflections (user_id, created_at desc);

create or replace function public.get_progress_analytics(
  p_start_date date,
  p_end_date date,
  p_previous_start_date date,
  p_previous_end_date date,
  p_heatmap_start_date date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  payload jsonb;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  if p_start_date is null or p_end_date is null or p_previous_start_date is null
    or p_previous_end_date is null or p_heatmap_start_date is null
    or p_start_date > p_end_date or p_previous_start_date > p_previous_end_date
    or p_heatmap_start_date > p_end_date then
    raise exception 'Invalid analytics date range' using errcode = '22007';
  end if;

  with
    period_plans as (
      select id, date, daily_score, closed_at
      from public.daily_plans
      where user_id = actor_id and date between p_start_date and p_end_date
    ),
    previous_plans as (
      select id, date, daily_score, closed_at
      from public.daily_plans
      where user_id = actor_id and date between p_previous_start_date and p_previous_end_date
    ),
    heatmap_plans as (
      select id, date, daily_score, closed_at
      from public.daily_plans
      where user_id = actor_id and date between p_heatmap_start_date and p_end_date
    ),
    period_activities as (
      select activity.category, activity.status, plan.date
      from public.activities activity
      inner join period_plans plan on plan.id = activity.daily_plan_id
      where activity.user_id = actor_id
    ),
    previous_activities as (
      select activity.status
      from public.activities activity
      inner join previous_plans plan on plan.id = activity.daily_plan_id
      where activity.user_id = actor_id
    ),
    heatmap_activity_counts as (
      select activity.daily_plan_id,
        count(*)::integer as planned_activities,
        count(*) filter (where activity.status = 'completed')::integer as completed_activities
      from public.activities activity
      inner join heatmap_plans plan on plan.id = activity.daily_plan_id
      where activity.user_id = actor_id
      group by activity.daily_plan_id
    ),
    heatmap_goal_counts as (
      select goal.daily_plan_id,
        count(*)::integer as planned_goals,
        count(*) filter (where goal.completed)::integer as completed_goals
      from public.daily_goals goal
      inner join heatmap_plans plan on plan.id = goal.daily_plan_id
      where goal.user_id = actor_id
      group by goal.daily_plan_id
    ),
    current_summary as (
      select
        (select count(*)::integer from period_plans) as planned_days,
        (select count(*) filter (where closed_at is not null)::integer from period_plans) as closed_days,
        (select coalesce(round(avg(daily_score))::integer, 0) from period_plans) as daily_score_average,
        (select count(*)::integer from period_activities) as activities_planned,
        (select count(*) filter (where status = 'completed')::integer from period_activities) as activities_completed,
        (select coalesce(sum(xp), 0)::integer from public.xp_events where user_id = actor_id and created_at::date between p_start_date and p_end_date) as xp_gained,
        (select count(*)::integer from public.daily_plans where user_id = actor_id and date between date_trunc('month', p_end_date::timestamp)::date and p_end_date) as active_days_this_month
    ),
    previous_summary as (
      select
        (select count(*)::integer from previous_plans) as planned_days,
        (select count(*) filter (where closed_at is not null)::integer from previous_plans) as closed_days,
        (select coalesce(round(avg(daily_score))::integer, 0) from previous_plans) as daily_score_average,
        (select count(*)::integer from previous_activities) as activities_planned,
        (select count(*) filter (where status = 'completed')::integer from previous_activities) as activities_completed
    )
  select jsonb_build_object(
    'summary', jsonb_build_object(
      'current', jsonb_build_object(
        'plannedDays', current_summary.planned_days,
        'closedDays', current_summary.closed_days,
        'dailyScoreAverage', case when current_summary.planned_days > 0 then current_summary.daily_score_average else null end,
        'activitiesPlanned', current_summary.activities_planned,
        'activitiesCompleted', current_summary.activities_completed,
        'completionPercentage', case when current_summary.activities_planned > 0 then round((current_summary.activities_completed::numeric / current_summary.activities_planned) * 100)::integer else null end,
        'xpGained', current_summary.xp_gained,
        'activeDaysThisMonth', current_summary.active_days_this_month
      ),
      'previous', jsonb_build_object(
        'plannedDays', previous_summary.planned_days,
        'closedDays', previous_summary.closed_days,
        'dailyScoreAverage', case when previous_summary.planned_days > 0 then previous_summary.daily_score_average else null end,
        'activitiesPlanned', previous_summary.activities_planned,
        'activitiesCompleted', previous_summary.activities_completed,
        'completionPercentage', case when previous_summary.activities_planned > 0 then round((previous_summary.activities_completed::numeric / previous_summary.activities_planned) * 100)::integer else null end
      )
    ),
    'dailyScores', coalesce((
      select jsonb_agg(jsonb_build_object('date', date, 'score', daily_score) order by date)
      from period_plans
    ), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'category', category,
        'planned', planned,
        'completed', completed,
        'percentage', case when planned > 0 then round((completed::numeric / planned) * 100)::integer else 0 end
      ) order by case when planned > 0 then completed::numeric / planned else 0 end desc, category)
      from (
        select category, count(*)::integer as planned, count(*) filter (where status = 'completed')::integer as completed
        from period_activities
        group by category
      ) category_stats
    ), '[]'::jsonb),
    'weekdays', coalesce((
      select jsonb_agg(jsonb_build_object(
        'weekday', weekday,
        'planned', planned,
        'completed', completed,
        'percentage', case when planned > 0 then round((completed::numeric / planned) * 100)::integer else null end
      ) order by weekday)
      from (
        select day_of_week.weekday,
          count(period_activities.date)::integer as planned,
          count(period_activities.date) filter (where period_activities.status = 'completed')::integer as completed
        from generate_series(1, 7) as day_of_week(weekday)
        left join period_activities on extract(isodow from period_activities.date)::integer = day_of_week.weekday
        group by day_of_week.weekday
      ) weekday_stats
    ), '[]'::jsonb),
    'heatmap', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', plan.date,
        'score', plan.daily_score,
        'plannedActivities', coalesce(activity_counts.planned_activities, 0),
        'completedActivities', coalesce(activity_counts.completed_activities, 0),
        'plannedGoals', coalesce(goal_counts.planned_goals, 0),
        'completedGoals', coalesce(goal_counts.completed_goals, 0),
        'closed', plan.closed_at is not null
      ) order by plan.date)
      from heatmap_plans plan
      left join heatmap_activity_counts activity_counts on activity_counts.daily_plan_id = plan.id
      left join heatmap_goal_counts goal_counts on goal_counts.daily_plan_id = plan.id
    ), '[]'::jsonb),
    'xpTimeline', coalesce((
      select jsonb_agg(jsonb_build_object('weekStart', week_start, 'xp', xp) order by week_start)
      from (
        select date_trunc('week', created_at)::date as week_start, sum(xp)::integer as xp
        from public.xp_events
        where user_id = actor_id and created_at::date between p_start_date and p_end_date
        group by date_trunc('week', created_at)::date
      ) xp_weeks
    ), '[]'::jsonb),
    'mood', coalesce((
      select jsonb_agg(jsonb_build_object('date', plan.date, 'score', reflection.mood_score) order by plan.date)
      from public.daily_reflections reflection
      inner join period_plans plan on plan.id = reflection.daily_plan_id
      where reflection.user_id = actor_id and reflection.mood_score is not null
    ), '[]'::jsonb),
    'gamification', jsonb_build_object(
      'totalXp', (select coalesce(sum(xp), 0)::integer from public.xp_events where user_id = actor_id),
      'planningDates', coalesce((select jsonb_agg(date order by date) from public.daily_plans where user_id = actor_id and date <= p_end_date), '[]'::jsonb),
      'achievements', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', achievement.id,
          'code', achievement.code,
          'name', achievement.name,
          'description', achievement.description,
          'icon', achievement.icon,
          'xpBonus', achievement.xp_bonus,
          'unlockedAt', user_achievement.unlocked_at
        ) order by (user_achievement.unlocked_at is not null) desc, achievement.name)
        from public.achievements achievement
        left join public.user_achievements user_achievement
          on user_achievement.achievement_id = achievement.id and user_achievement.user_id = actor_id
        where achievement.active
      ), '[]'::jsonb)
    )
  ) into payload
  from current_summary, previous_summary;

  return payload;
end;
$$;

revoke all on function public.get_progress_analytics(date, date, date, date, date) from public, anon;
grant execute on function public.get_progress_analytics(date, date, date, date, date) to authenticated;