export interface XpEvent {
  id: string
  user_id: string
  event_type: string
  source_type: string
  source_id: string
  xp: number
  description: string
  created_at: string
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string | null
  xp_bonus: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement: Achievement
}

export interface LevelProgress {
  level: number
  totalXp: number
  levelStartXp: number
  nextLevelXp: number
  progressPercentage: number
}

export interface StreakSummary {
  current: number
  best: number
}

export interface GamificationSummary {
  totalXp: number
  level: LevelProgress
  streak: StreakSummary
  achievements: UserAchievement[]
}
