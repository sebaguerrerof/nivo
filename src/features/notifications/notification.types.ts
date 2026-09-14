export type NotificationType = 'payment_due' | 'payment_overdue' | 'activity_upcoming' | 'plan_missing' | 'budget_critical' | 'achievement_unlocked'

export interface InAppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  entity_type: string | null
  entity_id: string | null
  action_path: string | null
  read_at: string | null
  created_at: string
}
