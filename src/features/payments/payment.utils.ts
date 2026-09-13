import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTodayInTimeZone, isCalendarDate } from '@/features/planning/planning.utils'
import type { PaymentOccurrence, PaymentOccurrenceStatus, PaymentStatusMeta, RecurringPaymentFrequency } from '@/features/payments/payment.types'

function dateParts(value: string) {
  if (!isCalendarDate(value)) throw new Error('Expected a calendar date.')
  return value.split('-').map(Number) as [number, number, number]
}

function toUtcDate(value: string) {
  const [year, month, day] = dateParts(value)
  return new Date(Date.UTC(year, month - 1, day))
}

function toCalendarDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function calculateNextPaymentDueDate(
  dueDate: string,
  frequency: RecurringPaymentFrequency,
  billingDay: number | null,
  customIntervalDays: number | null,
) {
  const date = toUtcDate(dueDate)
  if (frequency === 'weekly') date.setUTCDate(date.getUTCDate() + 7)
  if (frequency === 'biweekly') date.setUTCDate(date.getUTCDate() + 14)
  if (frequency === 'custom') date.setUTCDate(date.getUTCDate() + (customIntervalDays ?? 1))
  if (frequency === 'monthly') {
    const [year, month] = dateParts(dueDate)
    const nextMonthStart = new Date(Date.UTC(year, month, 1))
    const lastDay = new Date(Date.UTC(nextMonthStart.getUTCFullYear(), nextMonthStart.getUTCMonth() + 1, 0)).getUTCDate()
    nextMonthStart.setUTCDate(Math.min(billingDay ?? date.getUTCDate(), lastDay))
    return toCalendarDate(nextMonthStart)
  }
  return toCalendarDate(date)
}

export function getPaymentOccurrenceStatus(occurrence: Pick<PaymentOccurrence, 'due_date' | 'paid_at' | 'status'>, today: string): PaymentOccurrenceStatus {
  if (occurrence.paid_at || occurrence.status === 'paid') return 'paid'
  if (occurrence.status === 'skipped') return 'skipped'
  if (occurrence.due_date < today) return 'overdue'
  if (occurrence.due_date === today) return 'pending'
  return 'upcoming'
}

export function getPaymentStatusMeta(status: PaymentOccurrenceStatus): PaymentStatusMeta {
  const statuses: Record<PaymentOccurrenceStatus, PaymentStatusMeta> = {
    paid: { status: 'paid', label: 'Pagado', tone: 'teal' },
    skipped: { status: 'skipped', label: 'Omitido', tone: 'slate' },
    overdue: { status: 'overdue', label: 'Vencido', tone: 'rose' },
    pending: { status: 'pending', label: 'Vence hoy', tone: 'amber' },
    upcoming: { status: 'upcoming', label: 'Próximo', tone: 'slate' },
  }
  return statuses[status]
}

export function getDaysUntilPayment(dueDate: string, timezone: string, now = new Date()) {
  const today = getTodayInTimeZone(timezone, now)
  return Math.round((toUtcDate(dueDate).getTime() - toUtcDate(today).getTime()) / 86_400_000)
}

export function formatPaymentDate(value: string) {
  if (!isCalendarDate(value)) return value
  return format(new Date(`${value}T12:00:00Z`), "EEEE d 'de' MMMM", { locale: es })
}

export function isTherapyPayment(occurrence: Pick<PaymentOccurrence, 'recurring_payment'>) {
  return occurrence.recurring_payment?.category?.name.trim().toLocaleLowerCase('es-CL') === 'terapia'
}