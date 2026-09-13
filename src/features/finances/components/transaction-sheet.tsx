import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { transactionSchemaForCategories, type TransactionFormValues } from '@/features/finances/finance.schemas'
import { getDefaultTransactionDate } from '@/features/finances/finance.utils'
import type { FinanceMonth, FinancialCategory, FinancialTransaction, FinancialTransactionInput, FinancialTransactionType } from '@/features/finances/finance.types'

interface TransactionSheetProps {
  open: boolean
  period: FinanceMonth
  timezone: string
  categories: FinancialCategory[]
  initialType: FinancialTransactionType
  transaction?: FinancialTransaction | null
  saving: boolean
  onClose: () => void
  onSave: (input: FinancialTransactionInput) => Promise<unknown>
}

export function TransactionSheet({ open, period, timezone, categories, initialType, transaction, saving, onClose, onSave }: TransactionSheetProps) {
  const [showMore, setShowMore] = useState(Boolean(transaction?.payment_method || transaction?.notes))
  const [submitError, setSubmitError] = useState<string | null>(null)
  const activeCategories = useMemo(() => categories.filter((category) => category.active), [categories])
  const schema = useMemo(() => transactionSchemaForCategories(activeCategories), [activeCategories])
  const form = useForm<TransactionFormValues>({ resolver: zodResolver(schema), defaultValues: { type: initialType, categoryId: '', description: '', transactionDate: getDefaultTransactionDate(period, timezone), paymentMethod: '', notes: '' } })
  const selectedType = form.watch('type')
  const compatibleCategories = activeCategories.filter((category) => category.type === selectedType)

  useEffect(() => {
    if (!open) return
    const type = transaction?.type ?? initialType
    form.reset({
      type,
      amount: transaction?.amount,
      categoryId: transaction?.category_id ?? categories.find((category) => category.active && category.type === type)?.id ?? '',
      description: transaction?.description ?? '',
      transactionDate: transaction?.transaction_date ?? getDefaultTransactionDate(period, timezone),
      paymentMethod: transaction?.payment_method ?? '',
      notes: transaction?.notes ?? '',
    })
    setShowMore(Boolean(transaction?.payment_method || transaction?.notes))
    setSubmitError(null)
  }, [categories, form, initialType, open, period, timezone, transaction])

  useEffect(() => {
    const currentCategory = form.getValues('categoryId')
    if (!compatibleCategories.some((category) => category.id === currentCategory)) form.setValue('categoryId', compatibleCategories[0]?.id ?? '')
  }, [compatibleCategories, form])

  if (!open) return null

  const submit = form.handleSubmit(async (values) => {
    try {
      setSubmitError(null)
      await onSave({ ...values, paymentMethod: values.paymentMethod || null, notes: values.notes || null })
      onClose()
    } catch {
      setSubmitError(transaction ? 'No pudimos actualizar el movimiento. Intenta nuevamente.' : 'No pudimos guardar el movimiento. Intenta nuevamente.')
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="transaction-sheet-title">
      <button aria-label="Cerrar formulario" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" onClick={onClose} type="button" />
      <section className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-teal-700 dark:text-teal-300">{transaction ? 'Editar movimiento' : initialType === 'expense' ? 'Registro rápido' : 'Nuevo ingreso'}</p><h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]" id="transaction-sheet-title">{transaction ? transaction.description : initialType === 'expense' ? 'Agregar gasto' : 'Agregar ingreso'}</h2></div><Button aria-label="Cerrar" onClick={onClose} size="icon" type="button" variant="ghost"><X aria-hidden="true" className="size-5" /></Button></div>
        <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Monto" min="0.01" placeholder="0" step="0.01" type="number" />
            <Select {...form.register('type')} error={form.formState.errors.type?.message} label="Tipo"><option value="expense">Gasto</option><option value="income">Ingreso</option></Select>
          </div>
          <Select {...form.register('categoryId')} error={form.formState.errors.categoryId?.message} label="Categoría"><option value="">Selecciona una categoría</option>{compatibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.is_system ? '' : ' · Personal'}</option>)}</Select>
          <Input {...form.register('description')} error={form.formState.errors.description?.message} label="Descripción" placeholder={selectedType === 'expense' ? 'Ej. Supermercado' : 'Ej. Clase particular'} />
          <Input {...form.register('transactionDate')} error={form.formState.errors.transactionDate?.message} label="Fecha" type="date" />
          <button className="w-fit text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" onClick={() => setShowMore((value) => !value)} type="button">{showMore ? 'Ocultar opciones' : 'Más opciones'}</button>
          {showMore ? <div className="grid gap-4"><Input {...form.register('paymentMethod')} error={form.formState.errors.paymentMethod?.message} label="Método de pago (opcional)" placeholder="Ej. Débito, efectivo" /><Textarea {...form.register('notes')} error={form.formState.errors.notes?.message} label="Notas (opcional)" placeholder="Algún detalle que quieras recordar" /></div> : null}
          {submitError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{submitError}</p> : null}
          <div className="mt-1 flex gap-3"><Button className="flex-1" loading={saving} type="submit">{transaction ? 'Guardar cambios' : selectedType === 'expense' ? 'Guardar gasto' : 'Guardar ingreso'}</Button><Button onClick={onClose} type="button" variant="secondary">Cancelar</Button></div>
        </form>
      </section>
    </div>
  )
}
