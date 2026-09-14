import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260913001100_add_mvp_consolidation.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')

describe('MVP consolidation migration security', () => {
  it('keeps onboarding and notification preferences private on profiles', () => {
    expect(migration).toContain('onboarding_completed_at timestamptz')
    expect(migration).toContain('notification_preferences jsonb not null')
    expect(migration).toContain(`update public.profiles
set onboarding_completed_at = now()`)
    expect(migration).toContain('grant update (first_name, last_name, avatar_url, currency, timezone, onboarding_completed_at, onboarding_interests, notification_preferences)')
  })

  it('isolates notifications with RLS and does not grant client inserts', () => {
    expect(migration).toContain('alter table public.notifications enable row level security;')
    expect(migration).toContain('create policy "notifications_select_own"')
    expect(migration).toContain('auth.uid() = user_id')
    expect(migration).toContain('grant select, delete on public.notifications to authenticated;')
    expect(migration).not.toContain('grant insert on public.notifications to authenticated;')
  })

  it('scopes notification generation to the authenticated user', () => {
    expect(migration).toContain('actor_id uuid := auth.uid();')
    expect(migration).toContain('security definer')
    expect(migration).toContain('set search_path = public')
    expect(migration).toContain('on conflict (user_id, notification_key) do nothing;')
    expect(migration).toContain('grant execute on function public.sync_in_app_notifications() to authenticated;')
  })
})