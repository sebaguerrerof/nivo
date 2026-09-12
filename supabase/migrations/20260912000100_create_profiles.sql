-- Fase 1: perfil privado por usuario autenticado.
-- Esta migración se ejecuta con Supabase CLI (`supabase db push`) o desde el
-- SQL editor, conservando siempre la migración como fuente de verdad.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text,
  avatar_url text,
  currency text not null default 'CLP' check (char_length(currency) = 3),
  timezone text not null default 'America/Santiago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil privado asociado uno a uno a auth.users.';
comment on column public.profiles.user_id is 'Usuario propietario del perfil; se usa para RLS.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Crea el perfil de forma atómica cuando Supabase Auth registra un usuario.
-- Los metadatos proceden exclusivamente de los campos validados del registro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name, last_name, currency, timezone)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''), ''),
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'currency'), ''), 'CLP'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'timezone'), ''), 'America/Santiago')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (auth.uid() = user_id);

-- El cliente autenticado solo puede editar preferencias, nunca cambiar el
-- identificador, propietario ni marcas de auditoría del perfil.
revoke all on public.profiles from anon, authenticated;
grant select, insert, delete on public.profiles to authenticated;
grant update (first_name, last_name, avatar_url, currency, timezone) on public.profiles to authenticated;

-- Estas funciones son internas de triggers y no deben exponerse como RPC.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
