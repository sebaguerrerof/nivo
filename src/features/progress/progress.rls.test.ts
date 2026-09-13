import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260913000100_add_progress_analytics.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')

describe('progress analytics migration security', () => {
  it('derives the owner from auth.uid and keeps the aggregate function under invoker security', () => {
    expect(migration).toContain('actor_id uuid := auth.uid();')
    expect(migration).toContain('security invoker')
    expect(migration).toContain("where user_id = actor_id")
    expect(migration).toContain("raise exception 'Authentication is required'")
  })

  it('does not expose the RPC to anonymous callers and adds only required indexes', () => {
    expect(migration).toContain('revoke all on function public.get_progress_analytics(date, date, date, date, date) from public, anon;')
    expect(migration).toContain('grant execute on function public.get_progress_analytics(date, date, date, date, date) to authenticated;')
    expect(migration).toContain('create index if not exists daily_goals_user_plan_index')
    expect(migration).toContain('create index if not exists daily_reflections_user_created_at_index')
  })
})