import { describe, expect, it } from 'vitest'
import { markPaymentOccurrenceSchema, recurringPaymentSchema } from '@/features/payments/payment.schemas'

const categoryId = '4e42a07c-501a-4ec0-b010-b35f24426233'
const validPayment = { name: 'Terapia semanal', amount: 35_000, categoryId, frequency: 'weekly', billingDay: 13, startDate: '2026-09-13', nextDueDate: '2026-09-20', customIntervalDays: 30, notes: '', reminderDays: [7, 3, 1, 0] }

describe('payment schemas', () => {
  it('accepts a valid recurring payment and paid confirmation', () => {
    expect(recurringPaymentSchema.safeParse(validPayment).success).toBe(true)
    expect(markPaymentOccurrenceSchema.safeParse({ amount: 35_000, paidDate: '2026-09-13', paymentMethod: 'Débito', notes: '' }).success).toBe(true)
  })

  it('rejects invalid money, dates and custom intervals', () => {
    expect(recurringPaymentSchema.safeParse({ ...validPayment, amount: 0 }).success).toBe(false)
    expect(recurringPaymentSchema.safeParse({ ...validPayment, nextDueDate: '2026-02-30' }).success).toBe(false)
    expect(recurringPaymentSchema.safeParse({ ...validPayment, frequency: 'custom', customIntervalDays: 0 }).success).toBe(false)
    expect(markPaymentOccurrenceSchema.safeParse({ amount: -2, paidDate: '2026-09-13' }).success).toBe(false)
  })
})