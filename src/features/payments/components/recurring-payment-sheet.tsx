import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FinancialCategory } from '@/features/finances/finance.types'
import { recurringPaymentSchema, type RecurringPaymentFormValues } from '@/features/payments/payment.schemas'
import type { RecurringPayment, RecurringPaymentInput } from '@/features/payments/payment.types'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'

interface RecurringPaymentSheetProps {
  payment: RecurringPayment | null
  categories: FinancialCategory[]
  timezone: string
  saving: boolean
  onClose: () => void
  onSave: (input: RecurringPaymentInput) => Promise<unknown>
}

function dayFromCalendarDate(value: string) {
  return Number(value.slice(-2)) || 1
}

export function RecurringPaymentSheet({ payment, categories, timezone, saving, onClose, onSave }: RecurringPaymentSheetProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const expenseCategories = useMemo(() => categories.filter((category) => category.active && category.type === 'expense'), [categories])
  const form = useForm<RecurringPaymentFormValues>({ resolver: zodResolver(recurringPaymentSchema), defaultValues: { name: '', amount: 0, categoryId: '', frequency: 'monthly', billingDay: 1, startDate: '', nextDueDate: '', customIntervalDays: 30, notes: '', reminderDays: [7, 3, 1, 0] } })
  const frequency = form.watch('frequency')
  const nextDueDate = form.watch('nextDueDate')
  const reminderDays = form.watch('reminderDays')

  useEffect(() => {
    const today = getTodayInTimeZone(timezone)
    const therapyCategory = expenseCategories.find((category) => category.name.trim().toLocaleLowerCase('es-CL') === 'terapia')
    form.reset({
      name: payment?.name ?? '', amount: payment?.amount ?? 0,
      categoryId: payment?.category_id ?? therapyCategory?.id ?? expenseCategories[0]?.id ?? '',
      frequency: payment?.frequency ?? 'monthly', billingDay: payment?.billing_day ?? dayFromCalendarDate(payment?.next_due_date ?? today),
      startDate: payment?.start_date ?? today, nextDueDate: payment?.next_due_date ?? today,
      customIntervalDays: payment?.custom_interval_days ?? 30, notes: payment?.notes ?? '', reminderDays: payment?.reminder_days ?? [7, 3, 1, 0],
    })
    setSubmitError(null)
  }, [expenseCategories, form, payment, timezone])

  useEffect(() => {
    if (frequency === 'monthly' && nextDueDate) form.setValue('billingDay', dayFromCalendarDate(nextDueDate))
  }, [form, frequency, nextDueDate])

  const toggleReminder = (days: number) => {
    const next = reminderDays.includes(days) ? reminderDays.filter((value) => value !== days) : [...reminderDays, days].sort((left, right) => right - left)
    form.setValue('reminderDays', next, { shouldDirty: true })
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      setSubmitError(null)
      await onSave({
        ...values,
        billingDay: values.frequency === 'monthly' ? values.billingDay : null,
        customIntervalDays: values.frequency === 'custom' ? values.customIntervalDays : null,
        notes: values.notes || null,
      })
      onClose()
    } catch {
      setSubmitError(payment ? 'No pudimos actualizar este pago. Intenta nuevamente.' : 'No pudimos crear este pago. Intenta nuevamente.')
    }
  })

  return <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="recurring-payment-title"><button aria-label="Cerrar formulario" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" onClick={onClose} type="button" /><section className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-teal-700 dark:text-teal-300">{payment ? 'Editar pago' : 'Nueva obligación'}</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]" id="recurring-payment-title">{payment ? payment.name : 'Pago recurrente'}</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Nivo generará las próximas fechas y las separará de tus gastos ya registrados.</p></div><Button aria-label="Cerrar" onClick={onClose} size="icon" type="button" variant="ghost"><X aria-hidden="true" className="size-5" /></Button></div><form className="grid gap-4" onSubmit={(event) => void submit(event)}><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]"><Input {...form.register('name')} error={form.formState.errors.name?.message} label="Nombre" placeholder="Ej. Terapia semanal" /><Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Monto estimado" min="0.01" step="0.01" type="number" /></div><Select {...form.register('categoryId')} error={form.formState.errors.categoryId?.message} label="Categoría"><option value="">Selecciona una categoría</option>{expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select><div className="grid gap-4 sm:grid-cols-2"><Select {...form.register('frequency')} error={form.formState.errors.frequency?.message} label="Frecuencia"><option value="weekly">Semanal</option><option value="biweekly">Cada dos semanas</option><option value="monthly">Mensual</option><option value="custom">Personalizada</option></Select><Input {...form.register('nextDueDate')} error={form.formState.errors.nextDueDate?.message} label="Próximo vencimiento" type="date" /></div>{frequency === 'monthly' ? <Input {...form.register('billingDay', { valueAsNumber: true })} error={form.formState.errors.billingDay?.message} label="Día de cobro" max="31" min="1" type="number" /> : null}{frequency === 'custom' ? <Input {...form.register('customIntervalDays', { valueAsNumber: true })} error={form.formState.errors.customIntervalDays?.message} label="Cada cuántos días" min="1" type="number" /> : null}{!payment ? <Input {...form.register('startDate')} error={form.formState.errors.startDate?.message} label="Inicio" type="date" /> : null}<fieldset className="grid gap-2"><legend className="text-sm font-medium text-[var(--foreground)]">Recordatorios dentro de Nivo</legend><div className="flex flex-wrap gap-2">{[7, 3, 1, 0].map((days) => <label className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${reminderDays.includes(days) ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200' : 'border-[var(--border)] text-[var(--foreground-muted)]'}`} key={days}><input checked={reminderDays.includes(days)} className="accent-teal-700" onChange={() => toggleReminder(days)} type="checkbox" />{days === 0 ? 'El mismo día' : `${days} ${days === 1 ? 'día' : 'días'} antes`}</label>)}</div><p className="text-xs text-[var(--foreground-subtle)]">Se mostrarán como avisos dentro de Nivo.</p></fieldset><Textarea {...form.register('notes')} error={form.formState.errors.notes?.message} label="Nota (opcional)" placeholder="Ej. sesión con Dani" />{submitError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{submitError}</p> : null}<div className="flex gap-3"><Button className="flex-1" disabled={expenseCategories.length === 0} loading={saving} type="submit">{payment ? 'Guardar cambios' : 'Crear pago'}</Button><Button onClick={onClose} type="button" variant="secondary">Cancelar</Button></div></form></section></div>
}