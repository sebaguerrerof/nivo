-- Fase 2: planificación diaria privada. La propiedad se valida tanto en la
-- fila como en la relación con el plan padre; nunca se confía en user_id del cliente.

create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  wake_up_time time,
  daily_commitment text check (daily_commitment is null or char_length(daily_commitment) <= 280),
  notes text check (notes is null or char_length(notes) <= 2000),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_plans_user_date_key unique (user_id, date)
);

create table public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  position integer not null check (position >= 0),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text check (description is null or char_length(description) <= 1000),
  category text not null default 'personal' check (category in ('personal', 'work', 'sport', 'reading', 'family', 'finances', 'therapy', 'health', 'other')),
  start_at timestamptz,
  end_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'partial', 'skipped', 'rescheduled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_time_range_check check (end_at is null or start_at is null or end_at >= start_at)
);

create table public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_plan_id uuid not null unique references public.daily_plans(id) on delete cascade,
  what_went_well text check (what_went_well is null or char_length(what_went_well) <= 1000),
  what_to_improve text check (what_to_improve is null or char_length(what_to_improve) <= 1000),
  mood_score integer check (mood_score is null or mood_score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index daily_plans_user_date_index on public.daily_plans (user_id, date);
create index daily_goals_plan_position_index on public.daily_goals (daily_plan_id, position);
create index activities_user_start_at_index on public.activities (user_id, start_at);
create index activities_plan_start_at_index on public.activities (daily_plan_id, start_at);
create index daily_reflections_user_plan_index on public.daily_reflections (user_id, daily_plan_id);

create or replace function public.enforce_daily_goals_limit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if (select count(*) from public.daily_goals where daily_plan_id = new.daily_plan_id) >= 3 then
    raise exception 'A daily plan can have at most three goals' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger daily_plans_set_updated_at
before update on public.daily_plans
for each row execute procedure public.set_updated_at();

create trigger daily_goals_set_updated_at
before update on public.daily_goals
for each row execute procedure public.set_updated_at();

create trigger activities_set_updated_at
before update on public.activities
for each row execute procedure public.set_updated_at();

create trigger daily_reflections_set_updated_at
before update on public.daily_reflections
for each row execute procedure public.set_updated_at();

create trigger daily_goals_limit
before insert or update of daily_plan_id on public.daily_goals
for each row execute procedure public.enforce_daily_goals_limit();

alter table public.daily_plans enable row level security;
alter table public.daily_goals enable row level security;
alter table public.activities enable row level security;
alter table public.daily_reflections enable row level security;

create policy "daily_plans_select_own" on public.daily_plans for select to authenticated using (auth.uid() = user_id);
create policy "daily_plans_insert_own" on public.daily_plans for insert to authenticated with check (auth.uid() = user_id);
create policy "daily_plans_update_own" on public.daily_plans for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_plans_delete_own" on public.daily_plans for delete to authenticated using (auth.uid() = user_id);

create policy "daily_goals_select_own" on public.daily_goals for select to authenticated using (auth.uid() = user_id);
create policy "daily_goals_insert_own_plan" on public.daily_goals for insert to authenticated with check (
  auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())
);
create policy "daily_goals_update_own_plan" on public.daily_goals for update to authenticated using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())
);
create policy "daily_goals_delete_own" on public.daily_goals for delete to authenticated using (auth.uid() = user_id);

create policy "activities_select_own" on public.activities for select to authenticated using (auth.uid() = user_id);
create policy "activities_insert_own_plan" on public.activities for insert to authenticated with check (
  auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())
);
create policy "activities_update_own_plan" on public.activities for update to authenticated using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())
);
create policy "activities_delete_own" on public.activities for delete to authenticated using (auth.uid() = user_id);

create policy "daily_reflections_select_own" on public.daily_reflections for select to authenticated using (auth.uid() = user_id);
create policy "daily_reflections_insert_own_plan" on public.daily_reflections for insert to authenticated with check (
  auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())
);
create policy "daily_reflections_update_own_plan" on public.daily_reflections for update to authenticated using (auth.uid() = user_id) with check (
  auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())
);
create policy "daily_reflections_delete_own" on public.daily_reflections for delete to authenticated using (auth.uid() = user_id);

revoke all on public.daily_plans, public.daily_goals, public.activities, public.daily_reflections from anon, authenticated;
grant select, insert, update, delete on public.daily_plans, public.daily_goals, public.activities, public.daily_reflections to authenticated;
revoke execute on function public.enforce_daily_goals_limit() from public, anon, authenticated;
