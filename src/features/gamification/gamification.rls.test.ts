import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260912000400_add_gamification.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')

describe('gamification migration security', () => {
  it('enables RLS and exposes only own private gamification data', () => {
    expect(migration).toContain('alter table public.xp_events enable row level security;')
    expect(migration).toContain('alter table public.user_achievements enable row level security;')
    expect(migration).toContain('using (auth.uid() = user_id)')
    expect(migration).toContain('grant select on public.xp_events, public.achievements, public.user_achievements to authenticated;')
    expect(migration).not.toContain('grant insert on public.xp_events')
  })

  it('uses a unique source event and internal triggers to prevent duplicated XP', () => {
    expect(migration).toContain('constraint xp_events_user_source_event_key unique (user_id, event_type, source_type, source_id)')
    expect(migration).toContain("on conflict (user_id, event_type, source_type, source_id) do nothing;")
    expect(migration).toContain('create trigger activities_award_xp')
    expect(migration).toContain('security definer')
  })
})
