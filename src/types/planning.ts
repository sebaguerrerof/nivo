export const activityCategories = ['personal', 'work', 'sport', 'reading', 'family', 'finances', 'therapy', 'health', 'other'] as const
export const activityPriorities = ['low', 'normal', 'high'] as const
export const activityStatuses = ['pending', 'completed', 'partial', 'skipped', 'rescheduled'] as const

export type ActivityCategory = (typeof activityCategories)[number]
export type ActivityPriority = (typeof activityPriorities)[number]
export type ActivityStatus = (typeof activityStatuses)[number]

export interface DailyPlan {
  id: string
  user_id: string
  date: string
  wake_up_time: string | null
  recovery_activity: string | null
  responsibilities: string | null
  family_connection: string | null
  main_risk: string | null
  risk_strategy: string | null
  daily_commitment: string | null
  notes: string | null
  daily_score: number
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyGoal {
  id: string
  daily_plan_id: string
  user_id: string
  title: string
  position: number
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  daily_plan_id: string
  title: string
  description: string | null
  category: ActivityCategory
  start_at: string | null
  end_at: string | null
  priority: ActivityPriority
  status: ActivityStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface DailyReflection {
  id: string
  user_id: string
  daily_plan_id: string
  what_went_well: string | null
  what_to_improve: string | null
  mood_score: number | null
  created_at: string
  updated_at: string
}

export interface DailyPlanBundle {
  plan: DailyPlan
  goals: DailyGoal[]
  activities: Activity[]
  reflection: DailyReflection | null
}

export interface DailyPlanInput {
  date: string
  wakeUpTime?: string | null
  recoveryActivity?: string | null
  responsibilities?: string | null
  familyConnection?: string | null
  mainRisk?: string | null
  riskStrategy?: string | null
  dailyCommitment?: string | null
  notes?: string | null
}

export interface GoalInput {
  title: string
  position: number
}

export interface ActivityInput {
  title: string
  description?: string | null
  category: ActivityCategory
  startAt?: string | null
  endAt?: string | null
  priority: ActivityPriority
  status?: ActivityStatus
}

export interface DailyPlanDraftInput {
  plan: DailyPlanInput
  goals: GoalInput[]
  activities: ActivityInput[]
}

export interface ReflectionInput {
  whatWentWell?: string | null
  whatToImprove?: string | null
  moodScore?: number | null
}