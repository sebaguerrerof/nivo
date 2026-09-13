import { z } from 'zod'
import { financialTransactionTypes, type FinancialCategory } from '@/features/finances/finance.types'

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida.')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const candidate = new Date(Date.UTC(year, month - 1, day))
    return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
  }, 'Selecciona una fecha válida.')

const optionalText = (maximum: number) => z.string().trim().max(maximum, `Máximo ${maximum} caracteres.`).optional()
const amountSchema = z.coerce.number({ invalid_type_error: 'Ingresa un monto válido.' }).finite('Ingresa un monto válido.')

export const transactionSchema = z.object({
  type: z.enum(financialTransactionTypes),
  amount: amountSchema.positive('El monto debe ser mayor que cero.'),
  categoryId: z.string().uuid('Selecciona una categoría.'),
  description: z.string().trim().min(1, 'Describe el movimiento.').max(160, 'Máximo 160 caracteres.'),
  transactionDate: calendarDateSchema,
  paymentMethod: optionalText(60),
  notes: optionalText(1_000),
})

export function transactionSchemaForCategories(categories: FinancialCategory[]) {
  return transactionSchema.superRefine((values, context) => {
    const category = categories.find((item) => item.id === values.categoryId)
    if (!category || !category.active || category.type !== values.type) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['categoryId'], message: 'Selecciona una categoría activa compatible.' })
    }
  })
}

export const financialCategorySchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre.').max(80, 'Máximo 80 caracteres.'),
  type: z.enum(financialTransactionTypes),
  icon: optionalText(80),
})

export const monthlyBudgetSchema = z.object({
  amount: amountSchema.min(0, 'El presupuesto no puede ser negativo.'),
  savingsTarget: amountSchema.min(0, 'La meta de ahorro no puede ser negativa.'),
})

export const categoryBudgetSchema = z.object({
  categoryId: z.string().uuid('Selecciona una categoría.'),
  amount: amountSchema.min(0, 'El presupuesto no puede ser negativo.'),
})

const monetaryValue = z.coerce.number().finite()

export const financeOverviewSchema = z.object({
  incomeTotal: monetaryValue,
  expenseTotal: monetaryValue,
  balance: monetaryValue,
  budget: z.object({
    id: z.string().uuid(),
    amount: monetaryValue,
    savingsTarget: monetaryValue,
  }).nullable(),
  expenseByCategory: z.array(z.object({
    categoryId: z.string().uuid().nullable(),
    categoryName: z.string(),
    icon: z.string().nullable(),
    amount: monetaryValue,
  })),
  cumulativeExpenses: z.array(z.object({
    date: calendarDateSchema,
    amount: monetaryValue,
    cumulativeAmount: monetaryValue,
  })),
  categoryBudgets: z.array(z.object({
    id: z.string().uuid(),
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    icon: z.string().nullable(),
    amount: monetaryValue,
    spent: monetaryValue,
  })),
}).transform((value) => ({
  ...value,
  budget: value.budget ? { id: value.budget.id, amount: value.budget.amount, savings_target: value.budget.savingsTarget } : null,
}))
export type TransactionFormValues = z.infer<typeof transactionSchema>
export type FinancialCategoryFormValues = z.infer<typeof financialCategorySchema>
export type MonthlyBudgetFormValues = z.infer<typeof monthlyBudgetSchema>
export type CategoryBudgetFormValues = z.infer<typeof categoryBudgetSchema>
