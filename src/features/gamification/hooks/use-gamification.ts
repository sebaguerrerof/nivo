import { useQuery } from '@tanstack/react-query'
import { gamificationKeys } from '@/features/gamification/gamification.keys'
import { gamificationService } from '@/services/gamification.service'

export function useGamificationSummary(userId: string | undefined, today: string) {
  return useQuery({
    queryKey: userId ? gamificationKeys.summary(userId, today) : gamificationKeys.all,
    queryFn: () => gamificationService.getSummary(userId as string, today),
    enabled: Boolean(userId && today),
  })
}
