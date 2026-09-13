import type { ProgressPeriod } from '@/features/progress/progress.types'

export const progressKeys = {
  all: ['progress'] as const,
  analytics: (userId: string, period: ProgressPeriod, endDate: string) => [...progressKeys.all, 'analytics', userId, period, endDate] as const,
}