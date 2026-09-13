import { z } from 'zod'
import { recurringPaymentFrequencies } from '@/features/payments/payment.types'

const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida.').refine((value) => {
  const [year, month, day] = value.split('-').map(Number)
  const candidate = new Date(Date.UTC(year, month - 1, day))
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
}, 'Selecciona una fecha válida.')

const amountSchema = z.coerce.number({ invalid_type_error: 'Ingresa un monto válido.' }).finite('Ingresa un monto válido.')
const optionalText = (maximum: number) => z.string().trim().max(maximum, `Máximo ${maximum} caracteres.`).optional()

export const recurringPaymentSchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre.').max(120, 'Máximo 120 caracteres.'),
  amount: amountSchema.positive('El monto debe ser mayor que cero.'),
  categoryId: z.string().uuid('Selecciona una categoría de gasto.'),
  frequency: z.enum(recurringPaymentFrequencies),
  billingDay: z.coerce.number().int().min(1).max(31),
  startDate: calendarDateSchema,
  nextDueDate: calendarDateSchema,
  customIntervalDays: z.coerce.number().int().min(1).max(3650),
  notes: optionalText(1_000),
  reminderDays: z.array(z.coerce.number().int().min(0).max(365)).max(8),
}).superRefine((values, context) => {
  if (values.frequency === 'monthly' && (!values.billingDay || values.billingDay > 31)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['billingDay'], message: 'Indica un día entre 1 y 31.' })
  }
  if (values.frequency === 'custom' && (!values.customIntervalDays || values.customIntervalDays < 1)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['customIntervalDays'], message: 'Indica cada cuántos días se repite.' })
  }
})

export const paymentOccurrenceSchema = z.object({
  dueDate: calendarDateSchema,
  amount: amountSchema.positive('El monto debe ser mayor que cero.'),
  status: z.enum(['upcoming', 'pending', 'paid', 'overdue', 'skipped']),
  paidAt: z.string().datetime().nullable(),
  paymentMethod: optionalText(60),
  notes: optionalText(1_000),
})

export const markPaymentOccurrenceSchema = z.object({
  amount: amountSchema.positive('El monto debe ser mayor que cero.'),
  paidDate: calendarDateSchema,
  paymentMethod: optionalText(60),
  notes: optionalText(1_000),
})

export type RecurringPaymentFormValues = z.infer<typeof recurringPaymentSchema>
export type PaymentOccurrenceFormValues = z.infer<typeof paymentOccurrenceSchema>
export type MarkPaymentOccurrenceFormValues = z.infer<typeof markPaymentOccurrenceSchema>