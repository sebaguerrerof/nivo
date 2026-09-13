import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const planningMigrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260912000200_create_daily_planning.sql', import.meta.url))
const guidedPlanningMigrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260912000300_add_guided_daily_planning.sql', import.meta.url))
const planningMigration = readFileSync(planningMigrationPath, 'utf8')
const guidedPlanningMigration = readFileSync(guidedPlanningMigrationPath, 'utf8')

describe('daily planning migration security', () => {
  it('enables RLS for every private planning table', () => {
    for (const table of ['daily_plans', 'daily_goals', 'activities', 'daily_reflections']) {
      expect(planningMigration).toContain(`alter table public.${table} enable row level security;`)
    }
  })

  it('requires ownership of both the row and its parent plan for child writes', () => {
    expect(planningMigration).toContain('auth.uid() = user_id and exists (select 1 from public.daily_plans plan where plan.id = daily_plan_id and plan.user_id = auth.uid())')
    expect(planningMigration).toContain('before insert or update of daily_plan_id on public.daily_goals')
    expect(planningMigration).toContain('revoke all on public.daily_plans, public.daily_goals, public.activities, public.daily_reflections from anon, authenticated;')
  })

  it('keeps guided creation inside the caller RLS context and grants no anonymous access', () => {
    expect(guidedPlanningMigration).toContain('security invoker')
    expect(guidedPlanningMigration).not.toContain('security definer')
    expect(guidedPlanningMigration).toContain('actor_id uuid := auth.uid();')
    expect(guidedPlanningMigration).toContain('grant execute on function public.create_daily_plan_with_content')
    expect(guidedPlanningMigration).toContain('to authenticated;')
    expect(guidedPlanningMigration).toContain('from public, anon;')
  })
})