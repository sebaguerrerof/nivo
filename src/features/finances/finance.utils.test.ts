import { describe, expect, it } from 'vitest'
import { buildFinanceInsights, calculateSafeToSpend, formatFinanceMonth, getAdjacentFinanceMonth, getBudgetUsage, getDaysRemainingInMonth, getFinanceMonthBounds } from '@/features/finances/finance.utils'

describe('finance utilities', () => {
  it('moves financial months across years without errors', () => {
    expect(getAdjacentFinanceMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(getAdjacentFinanceMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
  })

  it('labels the selected calendar month without shifting it to the previous month', () => {
    expect(formatFinanceMonth({ year: 2026, month: 9 })).toBe('Septiembre de 2026')
    expect(formatFinanceMonth({ year: 2026, month: 1 })).toBe('Enero de 2026')
  })
  it('handles months with 28, 29, 30 and 31 days', () => {
    expect(getFinanceMonthBounds({ year: 2026, month: 2 })).toMatchObject({ endDate: '2026-02-28', daysInMonth: 28 })
    expect(getFinanceMonthBounds({ year: 2028, month: 2 })).toMatchObject({ endDate: '2028-02-29', daysInMonth: 29 })
    expect(getFinanceMonthBounds({ year: 2026, month: 4 })).toMatchObject({ endDate: '2026-04-30', daysInMonth: 30 })
    expect(getFinanceMonthBounds({ year: 2026, month: 5 })).toMatchObject({ endDate: '2026-05-31', daysInMonth: 31 })
  })

  it('calculates remaining days inclusively and never divides by zero', () => {
    const now = new Date('2026-09-30T15:00:00Z')
    expect(getDaysRemainingInMonth({ year: 2026, month: 9 }, 'America/Santiago', now)).toBe(1)
    expect(calculateSafeToSpend(100_000, 20_000, 10_000, 1)).toEqual({ available: 70_000, dailyAvailable: 70_000, daysRemaining: 1 })
    expect(calculateSafeToSpend(100_000, 20_000, 10_000, 0)).toEqual({ available: 70_000, dailyAvailable: null, daysRemaining: 0 })
  })

  it('keeps negative available money visible and classifies budget thresholds', () => {
    expect(calculateSafeToSpend(50_000, 80_000, 10_000, 10)).toMatchObject({ available: -40_000, dailyAvailable: -4_000 })
    expect(getBudgetUsage(69, 100)?.state).toBe('normal')
    expect(getBudgetUsage(70, 100)?.state).toBe('attention')
    expect(getBudgetUsage(90, 100)?.state).toBe('high')
    expect(getBudgetUsage(100, 100)?.state).toBe('exceeded')
    expect(getBudgetUsage(50, 0)).toBeNull()
  })

  it('creates deterministic financial insights without an AI dependency', () => {
    expect(buildFinanceInsights({ incomeTotal: 100, expenseTotal: 80, balance: 20, budget: { id: 'a', amount: 100, savings_target: 0 }, expenseByCategory: [{ categoryId: 'b', categoryName: 'Alimentación', icon: null, amount: 80 }], cumulativeExpenses: [], categoryBudgets: [] })).toEqual([
      'Has utilizado 80% de tu presupuesto mensual.',
      'Alimentación es tu categoría de mayor gasto este mes.',
    ])
  })
})
