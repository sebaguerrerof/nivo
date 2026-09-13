import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { markPaymentOccurrenceSchema, type MarkPaymentOccurrenceFormValues } from '@/features/payments/payment.schemas'
import type { MarkPaymentOccurrenceInput, PaymentOccurrence } from '@/features/payments/payment.types'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'

interface MarkPaymentSheetProps {
  occurrence: PaymentOccurrence | null
  timezone: string
  saving: boolean
  onClose: () => void
  onSave: (input: MarkPaymentOccurrenceInput) => Promise<unknown>
}

export function MarkPaymentSheet({ occurrence, timezone, saving, onClose, onSave }: MarkPaymentSheetProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<MarkPaymentOccurrenceFormValues>({ resolver: zodResolver(markPaymentOccurrenceSchema), defaultValues: { amount: 0, paidDate: '', paymentMethod: '', notes: '' } })

  useEffect(() => {
    if (!occurrence) return
    form.reset({ amount: occurrence.amount, paidDate: getTodayInTimeZone(timezone), paymentMethod: '', notes: '' })
    setSubmitError(null)
  }, [form, occurrence, timezone])

  if (!occurrence) return null
  const submit = form.handleSubmit(async (values) => {
    try {
      setSubmitError(null)
      await onSave({ ...values, paymentMethod: values.paymentMethod || null, notes: values.notes || null })
      onClose()
    } catch {
      setSubmitError('No pudimos registrar este pago. Intenta nuevamente.')
    }
  })

  return <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="mark-payment-title"><button aria-label="Cerrar confirmación" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" onClick={onClose} type="button" /><section className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-teal-700 dark:text-teal-300">Confirmar pago</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]" id="mark-payment-title">{occurrence.recurring_payment?.name ?? 'Pago recurrente'}</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Se creará el gasto correspondiente en tus finanzas.</p></div><Button aria-label="Cerrar" onClick={onClose} size="icon" type="button" variant="ghost"><X aria-hidden="true" className="size-5" /></Button></div><form className="grid gap-4" onSubmit={(event) => void submit(event)}><div className="grid gap-4 sm:grid-cols-2"><Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Monto pagado" min="0.01" step="0.01" type="number" /><Input {...form.register('paidDate')} error={form.formState.errors.paidDate?.message} label="Fecha de pago" type="date" /></div><Input {...form.register('paymentMethod')} error={form.formState.errors.paymentMethod?.message} label="Método de pago (opcional)" placeholder="Ej. Débito, transferencia" /><Textarea {...form.register('notes')} error={form.formState.errors.notes?.message} label="Nota (opcional)" placeholder="Algún detalle que quieras recordar" />{submitError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{submitError}</p> : null}<div className="flex gap-3"><Button className="flex-1" loading={saving} type="submit">Registrar como pagado</Button><Button onClick={onClose} type="button" variant="secondary">Cancelar</Button></div></form></section></div>
}