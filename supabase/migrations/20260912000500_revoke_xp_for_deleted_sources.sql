-- Un evento de XP deja de contar si se elimina su fuente. Así, recrear un
-- mismo plan o actividad no permite acumular XP artificialmente.

create or replace function public.revoke_xp_from_deleted_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.xp_events
  where user_id = old.user_id
    and event_type = 'activity_completed'
    and source_type = 'activity'
    and source_id = old.id;
  return old;
end;
$$;

create or replace function public.revoke_xp_from_deleted_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.xp_events
  where user_id = old.user_id
    and source_type = 'daily_plan'
    and source_id = old.id;
  return old;
end;
$$;

drop trigger if exists activities_revoke_xp_on_delete on public.activities;
create trigger activities_revoke_xp_on_delete
after delete on public.activities
for each row execute procedure public.revoke_xp_from_deleted_activity();

drop trigger if exists daily_plans_revoke_xp_on_delete on public.daily_plans;
create trigger daily_plans_revoke_xp_on_delete
after delete on public.daily_plans
for each row execute procedure public.revoke_xp_from_deleted_plan();

revoke execute on function public.revoke_xp_from_deleted_activity() from public, anon, authenticated;
revoke execute on function public.revoke_xp_from_deleted_plan() from public, anon, authenticated;
