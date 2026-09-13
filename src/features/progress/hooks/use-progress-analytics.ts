import { useQuery } from '@tanstack/react-query'
import { progressKeys } from '@/features/progress/progress.keys'
import type { ProgressPeriod, ProgressPeriodRange } from '@/features/progress/progress.types'
import { analyticsService } from '@/services/analytics.service'

interface ProgressAnalyticsScope {
  userId: string
  period: ProgressPeriod
  range: ProgressPeriodRange
}

export function useProgressAnalytics({ userId, period, range }: ProgressAnalyticsScope) {
  return useQuery({
    queryKey: progressKeys.analytics(userId, period, range.endDate),
    queryFn: () => analyticsService.getProgressAnalytics(range),
    enabled: Boolean(userId),
  })
}