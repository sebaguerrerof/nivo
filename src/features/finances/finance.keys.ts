import type { FinanceMonth, TransactionFilters } from '@/features/finances/finance.types'

export const financeKeys = {
  all: ['finances'] as const,
  user: (userId: string) => [...financeKeys.all, userId] as const,
  categories: (userId: string, includeInactive: boolean) => [...financeKeys.user(userId), 'categories', includeInactive] as const,
  transactions: (userId: string, period: FinanceMonth, filters: TransactionFilters) => [...financeKeys.user(userId), 'transactions', period.year, period.month, filters] as const,
  transactionRoot: (userId: string) => [...financeKeys.user(userId), 'transactions'] as const,
  overview: (userId: string, period: FinanceMonth, timezone: string) => [...financeKeys.user(userId), 'overview', period.year, period.month, timezone] as const,
  overviewRoot: (userId: string) => [...financeKeys.user(userId), 'overview'] as const,
}
