import type { FinancialCategory } from '@/features/finances/finance.types'

export const recurringPaymentFrequencies = ['weekly', 'biweekly', 'monthly', 'custom'] as const
export type RecurringPaymentFrequency = (typeof recurringPaymentFrequencies)[number]

export const paymentOccurrenceStatuses = ['upcoming', 'pending', 'paid', 'overdue', 'skipped'] as const
export type PaymentOccurrenceStatus = (typeof paymentOccurrenceStatuses)[number]

export interface RecurringPayment {
  id: string
  user_id: string
  name: string
  category_id: string
  amount: number
  frequency: RecurringPaymentFrequency
  billing_day: number | null
  custom_interval_days: number | null
  start_date: string
  next_due_date: string
  reminder_days: number[]
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
  category: Pick<FinancialCategory, 'id' | 'name' | 'type' | 'icon' | 'active'> | null
}

export interface PaymentOccurrence {
  id: string
  user_id: string
  recurring_payment_id: string
  due_date: string
  amount: number
  status: PaymentOccurrenceStatus
  paid_at: string | null
  payment_method: string | null
  notes: string | null
  transaction_id: string | null
  created_at: string
  updated_at: string
  recurring_payment: RecurringPayment | null
}

export interface RecurringPaymentInput {
  name: string
  amount: number
  categoryId: string
  frequency: RecurringPaymentFrequency
  billingDay?: number | null
  startDate: string
  nextDueDate: string
  reminderDays?: number[]
  customIntervalDays?: number | null
  notes?: string | null
  active?: boolean
}

export interface MarkPaymentOccurrenceInput {
  amount: number
  paidDate: string
  paymentMethod?: string | null
  notes?: string | null
}

export interface PaymentStatusMeta {
  status: PaymentOccurrenceStatus
  label: string
  tone: 'teal' | 'amber' | 'rose' | 'slate'
}