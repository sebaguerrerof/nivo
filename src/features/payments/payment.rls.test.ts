import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260913000500_add_recurring_payments.sql', import.meta.url))
const migration = readFileSync(migrationPath, 'utf8')
const undoMigrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260913000700_keep_undo_payment_schedule_consistent.sql', import.meta.url))
const undoMigration = readFileSync(undoMigrationPath, 'utf8')

describe('recurring payment migration security', () => {
  it('enables RLS and scopes all private tables to auth.uid()', () => {
    for (const table of ['recurring_payments', 'payment_occurrences']) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`)
    }
    expect(migration).toContain('auth.uid() = user_id')
    expect(migration).toContain('payment_occurrences_update_own_payment')
    expect(migration).toContain('payment_row.user_id <> new.user_id')
  })

  it('uses controlled write RPCs and keeps direct table privileges read-only', () => {
    expect(migration).toContain('revoke all on public.recurring_payments, public.payment_occurrences from anon, authenticated;')
    expect(migration).toContain('grant select on public.recurring_payments, public.payment_occurrences to authenticated;')
    expect(migration).toContain('create_recurring_payment')
    expect(migration).toContain('mark_payment_occurrence_paid')
    expect(migration).toContain('undo_payment_occurrence')
  })

  it('prevents duplicate occurrences and creates only one linked expense per paid occurrence', () => {
    expect(migration).toContain('unique (recurring_payment_id, due_date)')
    expect(migration).toContain('transaction_id uuid unique references public.financial_transactions')
    expect(migration).toContain('if occurrence_row.paid_at is not null then')
    expect(migration).toContain("'Pago: ' || payment_row.name")
    expect(migration).toContain('linked_transaction_id := occurrence_row.transaction_id')
  })

  it('excludes already-paid occurrences from the committed month total', () => {
    expect(migration).toContain('and paid_at is null')
    expect(migration).toContain("and status <> 'skipped'")
    expect(migration).toContain("'committedPending', committed_payments.committed_pending")
  })

  it('restores the original schedule when a payment is undone', () => {
    expect(undoMigration).toContain('generated_next_due_date := public.calculate_next_payment_due_date')
    expect(undoMigration).toContain('delete from public.payment_occurrences')
    expect(undoMigration).toContain('and transaction_id is null')
    expect(undoMigration).toContain('set next_due_date = occurrence_row.due_date')
  })
})