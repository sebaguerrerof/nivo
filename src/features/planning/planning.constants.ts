import type { ActivityCategory, ActivityPriority, ActivityStatus } from '@/types/planning'

export const DEFAULT_TIMEZONE = 'America/Santiago'

export const activityCategoryOptions: Array<{ value: ActivityCategory; label: string }> = [
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Trabajo' },
  { value: 'sport', label: 'Deporte' },
  { value: 'reading', label: 'Lectura' },
  { value: 'family', label: 'Familia' },
  { value: 'finances', label: 'Finanzas' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'health', label: 'Salud' },
  { value: 'other', label: 'Otro' },
]

export const activityPriorityLabels: Record<ActivityPriority, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
}

export const activityStatusLabels: Record<ActivityStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  partial: 'Parcial',
  skipped: 'Omitida',
  rescheduled: 'Reprogramada',
}
