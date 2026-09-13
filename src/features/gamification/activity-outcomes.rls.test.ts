import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260913000300_sync_xp_with_activity_outcomes.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')

describe('activity outcome XP migration', () => {
  it('revokes only the source XP event when a completed activity is corrected', () => {
    expect(migration).toContain("elsif old.status = 'completed' and new.status is distinct from 'completed' then")
    expect(migration).toContain('delete from public.xp_events')
    expect(migration).toContain("event_type = 'activity_completed'")
    expect(migration).toContain("source_type = 'activity'")
    expect(migration).toContain('source_id = old.id;')
  })

  it('keeps awarding idempotent and does not expose the trigger function as an RPC', () => {
    expect(migration).toContain("on conflict (user_id, event_type, source_type, source_id) do nothing;")
    expect(migration).toContain('security definer')
    expect(migration).toContain('revoke execute on function public.award_xp_from_activity() from public, anon, authenticated;')
  })
})
