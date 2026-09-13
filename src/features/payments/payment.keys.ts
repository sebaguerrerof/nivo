import type { FinanceMonth } from '@/features/finances/finance.types'

export const paymentKeys = {
  all: ['payments'] as const,
  user: (userId: string) => [...paymentKeys.all, userId] as const,
  recurring: (userId: string, includeInactive = false) => [...paymentKeys.user(userId), 'recurring', includeInactive] as const,
  occurrences: (userId: string, period: FinanceMonth) => [...paymentKeys.user(userId), 'occurrences', period.year, period.month] as const,
  occurrenceRoot: (userId: string) => [...paymentKeys.user(userId), 'occurrences'] as const,
  upcoming: (userId: string, timezone: string, limit: number) => [...paymentKeys.user(userId), 'upcoming', timezone, limit] as const,
  overdue: (userId: string, timezone: string) => [...paymentKeys.user(userId), 'overdue', timezone] as const,
  month: (userId: string, period: FinanceMonth) => paymentKeys.occurrences(userId, period),
  history: (userId: string, recurringPaymentId: string) => [...paymentKeys.user(userId), 'history', recurringPaymentId] as const,
}