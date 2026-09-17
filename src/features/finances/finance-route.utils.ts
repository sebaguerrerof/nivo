export type FinanceQuickAction = 'expense' | 'income' | 'budget' | null

export const financeQuickPaths = {
  expense: '/finances?quick=expense',
  income: '/finances?quick=income',
  budget: '/finances?quick=budget',
} as const

export function getFinanceQuickAction(search: string): FinanceQuickAction {
  const quick = new URLSearchParams(search).get('quick')

  return quick === 'expense' || quick === 'income' || quick === 'budget' ? quick : null
}