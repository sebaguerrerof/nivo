import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { profileService } from '@/services/profile.service'
import type { ProfileUpdate } from '@/types/profile'

export const profileKeys = {
  all: ['profile'] as const,
  own: (userId: string) => [...profileKeys.all, userId] as const,
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? profileKeys.own(userId) : profileKeys.all,
    queryFn: () => profileService.getOwnProfile(userId as string),
    enabled: Boolean(userId),
  })
}

export function useUpdateProfile(userId: string) {
  return useMutation({
    mutationFn: (input: ProfileUpdate) => profileService.updateOwnProfile(userId, input),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.own(userId), profile)
    },
  })
}
