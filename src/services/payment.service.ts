import { getFinanceMonthBounds } from '@/features/finances/finance.utils'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type {
  MarkPaymentOccurrenceInput,
  PaymentOccurrence,
  RecurringPayment,
  RecurringPaymentInput,
} from '@/features/payments/payment.types'
import type { FinanceMonth } from '@/features/finances/finance.types'
import { getSupabaseClient } from '@/lib/supabase/client'

const categoryColumns = 'id, name, type, icon, active'
const recurringPaymentColumns = `id, user_id, name, category_id, amount, frequency, billing_day, custom_interval_days, start_date, next_due_date, reminder_days, active, notes, created_at, updated_at, category:financial_categories(${categoryColumns})`
const occurrenceColumns = `id, user_id, recurring_payment_id, due_date, amount, status, paid_at, payment_method, notes, transaction_id, created_at, updated_at, recurring_payment:recurring_payments(${recurringPaymentColumns})`

function normalizeText(value: string | null | undefined) {
  const text = value?.trim()
  return text || null
}

function normalizeRelationship<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function toRecurringPayment(value: unknown): RecurringPayment {
  const payment = value as Omit<RecurringPayment, 'amount' | 'reminder_days' | 'category'> & {
    amount: string | number
    reminder_days: unknown
    category: RecurringPayment['category'] | RecurringPayment['category'][] | null
  }
  return {
    ...payment,
    amount: Number(payment.amount),
    reminder_days: Array.isArray(payment.reminder_days) ? payment.reminder_days.map(Number).filter(Number.isFinite) : [7, 3, 1, 0],
    category: normalizeRelationship(payment.category),
  }
}

function toPaymentOccurrence(value: unknown): PaymentOccurrence {
  const occurrence = value as Omit<PaymentOccurrence, 'amount' | 'recurring_payment'> & {
    amount: string | number
    recurring_payment: PaymentOccurrence['recurring_payment'] | PaymentOccurrence['recurring_payment'][] | null
  }
  const recurring = normalizeRelationship(occurrence.recurring_payment)
  return {
    ...occurrence,
    amount: Number(occurrence.amount),
    recurring_payment: recurring ? toRecurringPayment(recurring) : null,
  }
}

export const paymentService = {
  async getRecurringPayments(userId: string, includeInactive = false): Promise<RecurringPayment[]> {
    let query = getSupabaseClient().from('recurring_payments').select(recurringPaymentColumns).eq('user_id', userId).order('next_due_date')
    if (!includeInactive) query = query.eq('active', true)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []).map(toRecurringPayment)
  },

  async getPaymentOccurrences(userId: string, period: FinanceMonth): Promise<PaymentOccurrence[]> {
    const { startDate, endDate } = getFinanceMonthBounds(period)
    const { data, error } = await getSupabaseClient().from('payment_occurrences').select(occurrenceColumns)
      .eq('user_id', userId).gte('due_date', startDate).lte('due_date', endDate).order('due_date').order('created_at')
    if (error) throw error
    return (data ?? []).map(toPaymentOccurrence)
  },

  async getUpcomingPayments(userId: string, timezone: string, limit = 3): Promise<PaymentOccurrence[]> {
    const today = getTodayInTimeZone(timezone)
    const futureLimit = new Date(`${today}T12:00:00Z`)
    futureLimit.setUTCDate(futureLimit.getUTCDate() + 90)
    const { data, error } = await getSupabaseClient().from('payment_occurrences').select(occurrenceColumns)
      .eq('user_id', userId).lte('due_date', futureLimit.toISOString().slice(0, 10)).order('due_date').limit(100)
    if (error) throw error

    return (data ?? []).map(toPaymentOccurrence)
      .filter((occurrence) => occurrence.recurring_payment?.active)
      .filter((occurrence) => !['paid', 'skipped'].includes(getPaymentOccurrenceStatus(occurrence, today)))
      .sort((left, right) => {
        const leftStatus = getPaymentOccurrenceStatus(left, today)
        const rightStatus = getPaymentOccurrenceStatus(right, today)
        const priority = (status: PaymentOccurrence['status']) => status === 'overdue' ? 0 : status === 'pending' ? 1 : 2
        return priority(leftStatus) - priority(rightStatus) || left.due_date.localeCompare(right.due_date)
      })
      .slice(0, limit)
  },

  async getOverduePayments(userId: string, timezone: string): Promise<PaymentOccurrence[]> {
    const today = getTodayInTimeZone(timezone)
    const { data, error } = await getSupabaseClient().from('payment_occurrences').select(occurrenceColumns)
      .eq('user_id', userId).lt('due_date', today).order('due_date').limit(100)
    if (error) throw error
    return (data ?? []).map(toPaymentOccurrence)
      .filter((occurrence) => occurrence.recurring_payment?.active)
      .filter((occurrence) => getPaymentOccurrenceStatus(occurrence, today) === 'overdue')
  },

  async createRecurringPayment(input: RecurringPaymentInput): Promise<RecurringPayment> {
    const { data, error } = await getSupabaseClient().rpc('create_recurring_payment', {
      p_name: input.name.trim(), p_amount: input.amount, p_category_id: input.categoryId, p_frequency: input.frequency,
      p_billing_day: input.frequency === 'monthly' ? input.billingDay ?? null : null,
      p_start_date: input.startDate, p_next_due_date: input.nextDueDate,
      p_reminder_days: input.reminderDays ?? [7, 3, 1, 0],
      p_custom_interval_days: input.frequency === 'custom' ? input.customIntervalDays ?? null : null,
      p_notes: normalizeText(input.notes),
    }).single()
    if (error) throw error
    return toRecurringPayment(data)
  },

  async updateRecurringPayment(paymentId: string, input: RecurringPaymentInput): Promise<RecurringPayment> {
    const { data, error } = await getSupabaseClient().rpc('update_recurring_payment', {
      p_payment_id: paymentId, p_name: input.name.trim(), p_amount: input.amount, p_category_id: input.categoryId,
      p_frequency: input.frequency, p_billing_day: input.frequency === 'monthly' ? input.billingDay ?? null : null,
      p_next_due_date: input.nextDueDate, p_reminder_days: input.reminderDays ?? [7, 3, 1, 0],
      p_custom_interval_days: input.frequency === 'custom' ? input.customIntervalDays ?? null : null,
      p_notes: normalizeText(input.notes), p_active: input.active ?? true,
    }).single()
    if (error) throw error
    return toRecurringPayment(data)
  },

  async setRecurringPaymentActive(paymentId: string, active: boolean): Promise<RecurringPayment> {
    const { data, error } = await getSupabaseClient().rpc('pause_recurring_payment', { p_payment_id: paymentId, p_active: active }).single()
    if (error) throw error
    return toRecurringPayment(data)
  },

  async deleteRecurringPayment(paymentId: string) {
    const { error } = await getSupabaseClient().rpc('delete_recurring_payment', { p_payment_id: paymentId })
    if (error) throw error
  },

  async markOccurrencePaid(occurrenceId: string, input: MarkPaymentOccurrenceInput): Promise<PaymentOccurrence> {
    const { data, error } = await getSupabaseClient().rpc('mark_payment_occurrence_paid', {
      p_occurrence_id: occurrenceId, p_amount: input.amount, p_paid_date: input.paidDate,
      p_payment_method: normalizeText(input.paymentMethod), p_notes: normalizeText(input.notes),
    }).single()
    if (error) throw error
    return toPaymentOccurrence(data)
  },

  async undoOccurrence(occurrenceId: string): Promise<PaymentOccurrence> {
    const { data, error } = await getSupabaseClient().rpc('undo_payment_occurrence', { p_occurrence_id: occurrenceId }).single()
    if (error) throw error
    return toPaymentOccurrence(data)
  },
}