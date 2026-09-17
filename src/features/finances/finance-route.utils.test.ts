import { describe, expect, it } from 'vitest'

import { financeQuickPaths, getFinanceQuickAction } from './finance-route.utils'

describe('getFinanceQuickAction', () => {
  it.each([
    ['?quick=expense', 'expense'],
    ['?quick=income', 'income'],
    ['?quick=budget', 'budget'],
  ] as const)('recognizes %s', (search, expected) => {
    expect(getFinanceQuickAction(search)).toBe(expected)
  })

  it('ignores unsupported or legacy actions', () => {
    expect(getFinanceQuickAction('?action=budget')).toBeNull()
    expect(getFinanceQuickAction('?quick=anything-else')).toBeNull()
  })

  it('provides route-safe paths for all quick actions', () => {
    expect(financeQuickPaths).toEqual({
      expense: '/finances?quick=expense',
      income: '/finances?quick=income',
      budget: '/finances?quick=budget',
    })
  })
})