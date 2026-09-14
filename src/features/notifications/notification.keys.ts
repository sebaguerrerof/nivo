export const notificationKeys = {
  all: ['notifications'] as const,
  user: (userId: string) => [...notificationKeys.all, userId] as const,
}
