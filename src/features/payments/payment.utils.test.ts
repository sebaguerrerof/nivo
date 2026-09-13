import { describe, expect, it } from 'vitest'
import { calculateNextPaymentDueDate, getDaysUntilPayment, getPaymentOccurrenceStatus, getPaymentStatusMeta } from '@/features/payments/payment.utils'

describe('payment utilities', () => {
  it('calculates weekly, biweekly and custom recurring dates from calendar dates', () => {
    expect(calculateNextPaymentDueDate('2026-09-13', 'weekly', null, null)).toBe('2026-09-20')
    expect(calculateNextPaymentDueDate('2026-09-13', 'biweekly', null, null)).toBe('2026-09-27')
    expect(calculateNextPaymentDueDate('2026-09-13', 'custom', null, 45)).toBe('2026-10-28')
  })

  it('keeps a monthly billing day at the end of short months', () => {
    expect(calculateNextPaymentDueDate('2026-01-31', 'monthly', 31, null)).toBe('2026-02-28')
    expect(calculateNextPaymentDueDate('2028-01-31', 'monthly', 31, null)).toBe('2028-02-29')
    expect(calculateNextPaymentDueDate('2026-12-31', 'monthly', 31, null)).toBe('2027-01-31')
  })

  it('derives paid, overdue, today and future status in one central rule', () => {
    const today = '2026-09-13'
    expect(getPaymentOccurrenceStatus({ due_date: '2026-09-10', paid_at: null, status: 'upcoming' }, today)).toBe('overdue')
    expect(getPaymentOccurrenceStatus({ due_date: today, paid_at: null, status: 'upcoming' }, today)).toBe('pending')
    expect(getPaymentOccurrenceStatus({ due_date: '2026-09-20', paid_at: null, status: 'upcoming' }, today)).toBe('upcoming')
    expect(getPaymentOccurrenceStatus({ due_date: '2026-09-10', paid_at: '2026-09-10T12:00:00Z', status: 'paid' }, today)).toBe('paid')
    expect(getPaymentStatusMeta('overdue')).toMatchObject({ label: 'Vencido', tone: 'rose' })
  })

  it('computes day distance without time-of-day drift', () => {
    expect(getDaysUntilPayment('2026-09-15', 'America/Santiago', new Date('2026-09-13T15:00:00Z'))).toBe(2)
  })
})