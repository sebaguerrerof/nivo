import { describe, expect, it } from 'vitest'
import { categoryBudgetSchema, financialCategorySchema, monthlyBudgetSchema, transactionSchema, transactionSchemaForCategories } from '@/features/finances/finance.schemas'
import type { FinancialCategory } from '@/features/finances/finance.types'

const expenseCategory: FinancialCategory = { id: '4e42a07c-501a-4ec0-b010-b35f24426233', user_id: null, name: 'Alimentación', type: 'expense', icon: null, is_system: true, active: true, created_at: '', updated_at: '' }

describe('finance schemas', () => {
  const validTransaction = { type: 'expense', amount: 28_500, categoryId: expenseCategory.id, description: 'Supermercado', transactionDate: '2026-09-13', paymentMethod: '', notes: '' }

  it('accepts valid financial inputs and zero budgets', () => {
    expect(transactionSchema.safeParse(validTransaction).success).toBe(true)
    expect(monthlyBudgetSchema.safeParse({ amount: 0, savingsTarget: 0 }).success).toBe(true)
    expect(categoryBudgetSchema.safeParse({ categoryId: expenseCategory.id, amount: 0 }).success).toBe(true)
    expect(financialCategorySchema.safeParse({ name: 'Mascotas', type: 'expense', icon: '' }).success).toBe(true)
  })

  it('rejects invalid money, date and text values', () => {
    expect(transactionSchema.safeParse({ ...validTransaction, amount: 0 }).success).toBe(false)
    expect(transactionSchema.safeParse({ ...validTransaction, transactionDate: '2026-02-30' }).success).toBe(false)
    expect(transactionSchema.safeParse({ ...validTransaction, description: '' }).success).toBe(false)
    expect(monthlyBudgetSchema.safeParse({ amount: -1, savingsTarget: 0 }).success).toBe(false)
  })

  it('requires an active category compatible with the transaction type', () => {
    expect(transactionSchemaForCategories([expenseCategory]).safeParse(validTransaction).success).toBe(true)
    expect(transactionSchemaForCategories([expenseCategory]).safeParse({ ...validTransaction, type: 'income' }).success).toBe(false)
    expect(transactionSchemaForCategories([{ ...expenseCategory, active: false }]).safeParse(validTransaction).success).toBe(false)
  })
})
