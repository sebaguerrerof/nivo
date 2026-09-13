import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ getSupabaseClient: () => ({ rpc: mocks.rpc }) }))

import { paymentService } from '@/services/payment.service'

const categoryId = '4e42a07c-501a-4ec0-b010-b35f24426233'
const paymentId = '6e70a07c-501a-4ec0-b010-b35f24426233'
const occurrenceId = '7e70a07c-501a-4ec0-b010-b35f24426233'
const recurringRow = { id: paymentId, user_id: 'd3796582-2a76-4ef9-9037-6b1cd36d2984', name: 'Terapia', category_id: categoryId, amount: '35000.00', frequency: 'weekly', billing_day: null, custom_interval_days: null, start_date: '2026-09-01', next_due_date: '2026-09-15', reminder_days: [7, 3, 1, 0], active: true, notes: null, created_at: '', updated_at: '', category: { id: categoryId, name: 'Terapia', type: 'expense', icon: 'heart', active: true } }

describe('payment service mutations', () => {
  beforeEach(() => mocks.rpc.mockReset())

  it('creates a recurring payment through its controlled RPC', async () => {
    const single = vi.fn().mockResolvedValue({ data: recurringRow, error: null })
    mocks.rpc.mockReturnValue({ single })
    const result = await paymentService.createRecurringPayment({ name: ' Terapia ', amount: 35_000, categoryId, frequency: 'weekly', startDate: '2026-09-01', nextDueDate: '2026-09-15', notes: ' semanal ' })
    expect(mocks.rpc).toHaveBeenCalledWith('create_recurring_payment', expect.objectContaining({ p_name: 'Terapia', p_category_id: categoryId, p_notes: 'semanal' }))
    expect(result.amount).toBe(35_000)
  })

  it('deletes an unused recurring payment only through its controlled RPC', async () => {
    mocks.rpc.mockResolvedValue({ error: null })
    await paymentService.deleteRecurringPayment(paymentId)
    expect(mocks.rpc).toHaveBeenCalledWith('delete_recurring_payment', { p_payment_id: paymentId })
  })

  it('marks an occurrence as paid exclusively through the atomic RPC', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: occurrenceId, user_id: recurringRow.user_id, recurring_payment_id: paymentId, due_date: '2026-09-15', amount: '35000.00', status: 'paid', paid_at: '2026-09-15T12:00:00Z', payment_method: 'Débito', notes: null, transaction_id: '8e70a07c-501a-4ec0-b010-b35f24426233', created_at: '', updated_at: '', recurring_payment: recurringRow }, error: null })
    mocks.rpc.mockReturnValue({ single })
    const result = await paymentService.markOccurrencePaid(occurrenceId, { amount: 35_000, paidDate: '2026-09-15', paymentMethod: ' Débito ' })
    expect(mocks.rpc).toHaveBeenCalledWith('mark_payment_occurrence_paid', expect.objectContaining({ p_occurrence_id: occurrenceId, p_amount: 35_000, p_payment_method: 'Débito' }))
    expect(result.transaction_id).toBeTruthy()
    expect(result.amount).toBe(35_000)
  })
})