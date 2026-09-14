import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationKeys } from '@/features/notifications/notification.keys'
import { notificationService } from '@/services/notification.service'

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient()
  const notifications = useQuery({
    queryKey: userId ? notificationKeys.user(userId) : notificationKeys.all,
    queryFn: () => notificationService.getOwnNotifications(userId as string),
    enabled: Boolean(userId),
  })
  const sync = useMutation({
    mutationFn: () => notificationService.sync(),
    onSuccess: () => userId ? queryClient.invalidateQueries({ queryKey: notificationKeys.user(userId) }) : undefined,
  })
  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => userId ? queryClient.invalidateQueries({ queryKey: notificationKeys.user(userId) }) : undefined,
  })
  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(userId as string),
    onSuccess: () => userId ? queryClient.invalidateQueries({ queryKey: notificationKeys.user(userId) }) : undefined,
  })

  useEffect(() => {
    if (userId) void sync.mutateAsync().catch(() => undefined)
    // La sincronización es idempotente y se ejecuta solo al iniciar la sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { notifications, markRead, markAllRead }
}
