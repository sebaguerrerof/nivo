export const dailyPlanKeys = {
  all: ['daily-plan'] as const,
  byDate: (userId: string, date: string) => [...dailyPlanKeys.all, userId, date] as const,
  today: (userId: string, date: string) => dailyPlanKeys.byDate(userId, date),
}
