import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({ from: mocks.from }),
}))

import { financeService } from '@/services/finance.service'

const userId = 'd3796582-2a76-4ef9-9037-6b1cd36d2984'
const categoryId = '4e42a07c-501a-4ec0-b010-b35f24426233'
const transactionId = '6e70a07c-501a-4ec0-b010-b35f24426233'
const input = { type: 'expense' as const, amount: 28_500, categoryId, description: ' Supermercado ', transactionDate: '2026-09-13', paymentMethod: ' Débito ', notes: ' semanal ' }
const row = { id: transactionId, user_id: userId, type: 'expense', amount: '28500.00', category_id: categoryId, description: 'Supermercado', transaction_date: '2026-09-13', payment_method: 'Débito', notes: 'semanal', created_at: '', updated_at: '', category: { id: categoryId, name: 'Alimentación', type: 'expense', icon: null, is_system: true, active: true } }

describe('finance service transaction mutations', () => {
  beforeEach(() => mocks.from.mockReset())

  it('creates a scoped expense and normalizes its returned amount', async () => {
    const single = vi.fn().mockResolvedValue({ data: row, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    mocks.from.mockReturnValue({ insert })

    const result = await financeService.createTransaction(userId, input)

    expect(mocks.from).toHaveBeenCalledWith('financial_transactions')
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: userId, category_id: categoryId, description: 'Supermercado', payment_method: 'Débito', notes: 'semanal' }))
    expect(result.amount).toBe(28_500)
  })

  it('edits only the owner transaction and keeps the category relation explicit', async () => {
    const single = vi.fn().mockResolvedValue({ data: { ...row, amount: '30000.00' }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const ownerFilter = vi.fn().mockReturnValue({ select })
    const idFilter = vi.fn().mockReturnValue({ eq: ownerFilter })
    const update = vi.fn().mockReturnValue({ eq: idFilter })
    mocks.from.mockReturnValue({ update })

    const result = await financeService.updateTransaction(userId, transactionId, { ...input, amount: 30_000 })

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ amount: 30_000, category_id: categoryId }))
    expect(idFilter).toHaveBeenCalledWith('id', transactionId)
    expect(ownerFilter).toHaveBeenCalledWith('user_id', userId)
    expect(result.amount).toBe(30_000)
  })

  it('deletes only the owner transaction after the caller has confirmed in UI', async () => {
    const ownerFilter = vi.fn().mockResolvedValue({ error: null })
    const idFilter = vi.fn().mockReturnValue({ eq: ownerFilter })
    const remove = vi.fn().mockReturnValue({ eq: idFilter })
    mocks.from.mockReturnValue({ delete: remove })

    await financeService.deleteTransaction(userId, transactionId)

    expect(idFilter).toHaveBeenCalledWith('id', transactionId)
    expect(ownerFilter).toHaveBeenCalledWith('user_id', userId)
  })
})
