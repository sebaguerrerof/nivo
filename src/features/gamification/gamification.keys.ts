export const gamificationKeys = {
  all: ['gamification'] as const,
  summary: (userId: string, today: string) => [...gamificationKeys.all, 'summary', userId, today] as const,
}
