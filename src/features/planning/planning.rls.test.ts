import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260912000200_create_daily_planning.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')

describe('daily planning migration security', () => {
  it('enables RLS for every private planning table', () => {
    for (const table of ['daily_plans', 'daily_goals', 'activities', 'daily_reflections']) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`)
    }
  })

  it('requires ownership of both the row and its parent plan for child writes', () => {
    expect(migration).toContain('auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())')
    expect(migration).toContain('before insert or update of daily_plan_id on public.daily_goals')
    expect(migration).toContain("revoke all on public.daily_plans, public.daily_goals, public.activities, public.daily_reflections from anon, authenticated;")
  })
})