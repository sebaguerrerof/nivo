import { levelThresholds } from '@/features/gamification/gamification.constants'
import type { LevelProgress, StreakSummary } from '@/types/gamification'

function formatCalendarDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function previousCalendarDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return formatCalendarDate(new Date(Date.UTC(year, month - 1, day - 1)))
}

function getLevelThreshold(level: number) {
  if (level <= levelThresholds.length) return levelThresholds[level - 1]

  const lastKnownLevel = levelThresholds.length
  const lastKnownThreshold = levelThresholds[lastKnownLevel - 1]
  const additionalLevels = level - lastKnownLevel
  return lastKnownThreshold + additionalLevels * 550
}

export function calculateLevel(totalXp: number): LevelProgress {
  const safeTotalXp = Math.max(0, Math.floor(totalXp))
  let level = 1

  while (safeTotalXp >= getLevelThreshold(level + 1)) level += 1

  const levelStartXp = getLevelThreshold(level)
  const nextLevelXp = getLevelThreshold(level + 1)
  const progressPercentage = Math.min(100, Math.round(((safeTotalXp - levelStartXp) / (nextLevelXp - levelStartXp)) * 100))

  return { level, totalXp: safeTotalXp, levelStartXp, nextLevelXp, progressPercentage }
}

export function calculatePlanningStreak(planDates: string[], today: string): StreakSummary {
  const dates = [...new Set(planDates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= today))].sort()
  const dateSet = new Set(dates)
  let current = 0
  let cursor = today

  while (dateSet.has(cursor)) {
    current += 1
    cursor = previousCalendarDate(cursor)
  }

  let best = 0
  let running = 0
  let previous: string | null = null
  for (const date of dates) {
    running = previous === previousCalendarDate(date) ? running + 1 : 1
    best = Math.max(best, running)
    previous = date
  }

  return { current, best }
}
