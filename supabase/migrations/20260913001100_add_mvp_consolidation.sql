-- Estado de onboarding y preferencias que no existían cuando se crearon los
-- perfiles originales. Las cuentas existentes se consideran introducidas para
-- no interrumpir su uso; los perfiles nuevos nacen con onboarding pendiente.
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists onboarding_interests text[] not null default '{}',
  add column if not exists notification_preferences jsonb not null default '{"activities": true, "payments": true, "finances": true, "achievements": true}'::jsonb;

update public.profiles
set onboarding_completed_at = now()
where onboarding_completed_at is null;

alter table public.profiles
  add constraint profiles_onboarding_interests_check
    check (cardinality(onboarding_interests) <= 8),
  add constraint profiles_notification_preferences_check
    check (jsonb_typeof(notification_preferences) = 'object');

revoke all on public.profiles from anon, authenticated;
grant select, insert, delete on public.profiles to authenticated;
grant update (first_name, last_name, avatar_url, currency, timezone, onboarding_completed_at, onboarding_interests, notification_preferences) on public.profiles to authenticated;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('payment_due', 'payment_overdue', 'activity_upcoming', 'plan_missing', 'budget_critical', 'achievement_unlocked')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  entity_type text,
  entity_id uuid,
  action_path text check (action_path is null or action_path like '/%'),
  notification_key text not null check (char_length(notification_key) between 1 and 180),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, notification_key)
);

create index notifications_user_read_created_index
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_delete_own" on public.notifications for delete to authenticated using (auth.uid() = user_id);

revoke all on public.notifications from anon, authenticated;
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create or replace function public.sync_in_app_notifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  profile_row public.profiles;
  local_today date;
  month_start date;
  month_end date;
  budget_row public.monthly_budgets;
  expense_total numeric;
begin
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  select * into profile_row from public.profiles where user_id = actor_id;
  if not found then
    raise exception 'Profile was not found' using errcode = 'P0002';
  end if;

  local_today := (now() at time zone profile_row.timezone)::date;

  if coalesce((profile_row.notification_preferences ->> 'activities')::boolean, true) then
    insert into public.notifications (user_id, type, title, message, entity_type, action_path, notification_key)
    select actor_id, 'plan_missing', 'Tu día sigue abierto', 'Todavía no tienes una planificación para hoy.', 'daily_plan', '/today?date=' || local_today::text, 'plan-missing:' || local_today::text
    where not exists (select 1 from public.daily_plans where user_id = actor_id and date = local_today)
    on conflict (user_id, notification_key) do nothing;

    insert into public.notifications (user_id, type, title, message, entity_type, entity_id, action_path, notification_key)
    select actor_id, 'activity_upcoming', 'Actividad próxima', a.title || ' comienza pronto.', 'activity', a.id, '/today?date=' || local_today::text, 'activity-upcoming:' || a.id::text || ':' || local_today::text
    from public.activities a
    where a.user_id = actor_id
      and a.status = 'pending'
      and a.start_at >= now()
      and a.start_at < now() + interval '90 minutes'
    on conflict (user_id, notification_key) do nothing;
  end if;

  if coalesce((profile_row.notification_preferences ->> 'payments')::boolean, true) then
    insert into public.notifications (user_id, type, title, message, entity_type, entity_id, action_path, notification_key)
    select actor_id, 'payment_overdue', 'Tienes un pago vencido', coalesce(rp.name, 'Un pago') || ' está vencido.', 'payment_occurrence', po.id, '/payments', 'payment-overdue:' || po.id::text
    from public.payment_occurrences po
    join public.recurring_payments rp on rp.id = po.recurring_payment_id
    where po.user_id = actor_id and rp.active and po.paid_at is null and po.status <> 'skipped' and po.due_date < local_today
    on conflict (user_id, notification_key) do nothing;

    insert into public.notifications (user_id, type, title, message, entity_type, entity_id, action_path, notification_key)
    select actor_id, 'payment_due', 'Pago próximo', coalesce(rp.name, 'Un pago') || ' vence ' || case when po.due_date = local_today then 'hoy.' else 'mañana.' end, 'payment_occurrence', po.id, '/payments', 'payment-due:' || po.id::text
    from public.payment_occurrences po
    join public.recurring_payments rp on rp.id = po.recurring_payment_id
    where po.user_id = actor_id and rp.active and po.paid_at is null and po.status <> 'skipped' and po.due_date between local_today and local_today + 1
    on conflict (user_id, notification_key) do nothing;
  end if;

  if coalesce((profile_row.notification_preferences ->> 'finances')::boolean, true) then
    month_start := date_trunc('month', local_today)::date;
    month_end := (month_start + interval '1 month - 1 day')::date;
    select * into budget_row from public.monthly_budgets where user_id = actor_id and year = extract(year from local_today)::integer and month = extract(month from local_today)::integer;
    if found and budget_row.amount > 0 then
      select coalesce(sum(amount), 0) into expense_total from public.financial_transactions where user_id = actor_id and type = 'expense' and transaction_date between month_start and month_end;
      if expense_total >= budget_row.amount * 0.9 then
        insert into public.notifications (user_id, type, title, message, entity_type, entity_id, action_path, notification_key)
        values (actor_id, 'budget_critical', 'Tu presupuesto está cerca del límite', 'Ya utilizaste el 90% o más de tu presupuesto mensual.', 'monthly_budget', budget_row.id, '/finances', 'budget-critical:' || budget_row.id::text || ':' || month_start::text)
        on conflict (user_id, notification_key) do nothing;
      end if;
    end if;
  end if;
end;
$$;

create or replace function public.notify_achievement_unlocked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  achievement_name text;
begin
  select name into achievement_name from public.achievements where id = new.achievement_id;
  insert into public.notifications (user_id, type, title, message, entity_type, entity_id, action_path, notification_key)
  select new.user_id, 'achievement_unlocked', 'Nuevo logro desbloqueado', coalesce(achievement_name, 'Desbloqueaste un nuevo logro.') , 'achievement', new.achievement_id, '/progress', 'achievement:' || new.id::text
  where coalesce((select (notification_preferences ->> 'achievements')::boolean from public.profiles where user_id = new.user_id), true)
  on conflict (user_id, notification_key) do nothing;
  return new;
end;
$$;

create trigger user_achievements_notify_on_insert
after insert on public.user_achievements
for each row execute procedure public.notify_achievement_unlocked();

revoke all on function public.sync_in_app_notifications() from public, anon;
grant execute on function public.sync_in_app_notifications() to authenticated;
revoke execute on function public.notify_achievement_unlocked() from public, anon, authenticated;
