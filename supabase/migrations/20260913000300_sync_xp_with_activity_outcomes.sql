-- El XP de una actividad refleja su resultado actual. Corregir una actividad
-- de realizada a cualquier estado no realizado revoca exclusivamente su
-- evento idempotente; marcarla realizada otra vez lo restaura una sola vez.

create or replace function public.award_xp_from_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward integer;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    reward := case when new.priority = 'high' or new.category = 'sport' then 20 else 10 end;

    insert into public.xp_events (user_id, event_type, source_type, source_id, xp, description)
    values (new.user_id, 'activity_completed', 'activity', new.id, reward, 'Actividad completada')
    on conflict (user_id, event_type, source_type, source_id) do nothing;
  elsif old.status = 'completed' and new.status is distinct from 'completed' then
    delete from public.xp_events
    where user_id = old.user_id
      and event_type = 'activity_completed'
      and source_type = 'activity'
      and source_id = old.id;
  end if;

  return new;
end;
$$;

revoke execute on function public.award_xp_from_activity() from public, anon, authenticated;
