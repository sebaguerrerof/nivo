import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260913000400_add_personal_finances.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')

describe('personal finance migration security', () => {
  it('enables RLS and ownership policies for every private financial table', () => {
    for (const table of ['financial_categories', 'financial_transactions', 'monthly_budgets', 'category_budgets']) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`)
    }
    expect(migration).toContain('auth.uid() = user_id')
    expect(migration).toContain('financial_categories_select_system_or_own')
  })

  it('validates category and budget relations inside database triggers', () => {
    expect(migration).toContain('validate_financial_transaction_category')
    expect(migration).toContain("category_row.type <> new.type")
    expect(migration).toContain('category_row.user_id <> new.user_id')
    expect(migration).toContain('validate_category_budget_references')
    expect(migration).toContain('budget_row.user_id <> new.user_id')
    expect(migration).toContain("category_row.type <> 'expense'")
  })

  it('keeps the aggregate overview under invoker security and out of anonymous access', () => {
    expect(migration).toContain('actor_id uuid := auth.uid();')
    expect(migration).toContain('get_financial_month_overview')
    expect(migration).toContain('security invoker')
    expect(migration).toContain('revoke all on function public.get_financial_month_overview(integer, integer) from public, anon;')
    expect(migration).toContain('grant execute on function public.get_financial_month_overview(integer, integer) to authenticated;')
  })
})
