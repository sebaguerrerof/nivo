import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { categoryBudgetSchema, monthlyBudgetSchema, type CategoryBudgetFormValues, type MonthlyBudgetFormValues } from '@/features/finances/finance.schemas'
import { useCategoryBudgetActions, useMonthlyBudgetActions } from '@/features/finances/hooks/use-finances'
import { formatCurrency, getBudgetUsage, getBudgetUsageStateClass } from '@/features/finances/finance.utils'
import type { CategoryBudgetOverview, FinanceMonth, FinancialCategory, FinancialOverview } from '@/features/finances/finance.types'
import type { Currency } from '@/types/profile'

interface BudgetSectionProps {
  userId: string
  period: FinanceMonth
  currency: Currency
  categories: FinancialCategory[]
  overview: FinancialOverview
  initiallyEditing?: boolean
}

export function BudgetSection({ userId, period, currency, categories, overview, initiallyEditing = false }: BudgetSectionProps) {
  const [editingBudget, setEditingBudget] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const budgetMutation = useMonthlyBudgetActions(userId)
  const form = useForm<MonthlyBudgetFormValues>({ resolver: zodResolver(monthlyBudgetSchema), defaultValues: { amount: overview.budget?.amount ?? 0, savingsTarget: overview.budget?.savings_target ?? 0 } })
  const usage = getBudgetUsage(overview.expenseTotal, overview.budget?.amount ?? null)

  useEffect(() => {
    form.reset({ amount: overview.budget?.amount ?? 0, savingsTarget: overview.budget?.savings_target ?? 0 })
  }, [form, overview.budget])

  useEffect(() => {
    if (initiallyEditing) {
      setEditingBudget(true)
    }
  }, [initiallyEditing])

  const submit = form.handleSubmit(async (values) => {
    try {
      setSaveError(null)
      await budgetMutation.mutateAsync({ ...period, ...values })
      setEditingBudget(false)
    } catch {
      setSaveError('No pudimos guardar tu presupuesto. Intenta nuevamente.')
    }
  })

  return (
    <section aria-label="Presupuesto" className="scroll-mt-6" id="presupuesto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Presupuesto</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]">Un límite que te acompañe</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">Define solo lo que hoy te sirve observar; Nivo mantiene el resto en segundo plano.</p></div><Button onClick={() => setEditingBudget((value) => !value)} size="sm" type="button" variant={overview.budget ? 'secondary' : 'primary'}>{editingBudget ? 'Cerrar' : overview.budget ? 'Editar presupuesto' : 'Crear presupuesto'}</Button></div>

      <div className="mt-6 border-y border-[var(--border-subtle)] py-5 sm:py-6">
        {overview.budget && !editingBudget ? <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div><p className="text-sm font-semibold text-[var(--foreground)]">Gasto mensual</p><p className="mt-2 text-2xl font-bold tracking-[-0.045em] tabular-nums text-[var(--foreground)]">{formatCurrency(overview.expenseTotal, currency)} <span className="text-base font-medium text-[var(--foreground-muted)]">de {formatCurrency(overview.budget.amount, currency)}</span></p><div aria-label={`${usage?.percentage ?? 0}% del presupuesto utilizado`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.min(usage?.percentage ?? 0, 100)} className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--surface-subtle)]" role="progressbar"><div className={`h-full rounded-full ${getBudgetUsageStateClass(usage?.state ?? 'normal')}`} style={{ width: `${Math.min(usage?.percentage ?? 0, 100)}%` }} /></div><p className="mt-2 text-sm text-[var(--foreground-muted)]">{usage && usage.remaining >= 0 ? `${formatCurrency(usage.remaining, currency)} restantes dentro del presupuesto.` : 'Has superado el límite que definiste para este mes.'}</p></div><div className="sm:text-right"><p className="text-sm font-bold text-[var(--foreground)]">{usage?.percentage ?? 0}% utilizado</p>{overview.budget.savings_target > 0 ? <p className="mt-1 text-xs text-[var(--foreground-subtle)]">Meta de ahorro: {formatCurrency(overview.budget.savings_target, currency)}</p> : null}</div></div> : null}
        {!overview.budget && !editingBudget ? <div className="rounded-[var(--radius-control)] bg-[var(--surface-subtle)] px-4 py-5"><p className="font-semibold text-[var(--foreground)]">Aún no has definido un presupuesto para este mes.</p><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Puedes comenzar por un monto general y ajustar las categorías después.</p></div> : null}
        {editingBudget ? <form className="grid gap-4" onSubmit={(event) => void submit(event)}><div className="grid gap-4 sm:grid-cols-2"><Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Presupuesto mensual" min="0" step="0.01" type="number" /><Input {...form.register('savingsTarget', { valueAsNumber: true })} error={form.formState.errors.savingsTarget?.message} inputMode="decimal" label="Meta de ahorro (opcional)" min="0" step="0.01" type="number" /></div>{saveError ? <p className="text-sm text-rose-600 dark:text-rose-300">{saveError}</p> : null}<div className="flex flex-wrap gap-3"><Button loading={budgetMutation.isPending} type="submit">Guardar presupuesto</Button><Button onClick={() => { setEditingBudget(false); setSaveError(null) }} type="button" variant="secondary">Cancelar</Button></div></form> : null}
      </div>

      {overview.budget ? <CategoryBudgets categories={categories} currency={currency} overview={overview} userId={userId} /> : null}
    </section>
  )
}

interface CategoryBudgetsProps {
  userId: string
  currency: Currency
  categories: FinancialCategory[]
  overview: FinancialOverview
}

function CategoryBudgets({ userId, currency, categories, overview }: CategoryBudgetsProps) {
  const [editing, setEditing] = useState<CategoryBudgetOverview | null>(null)
  const [adding, setAdding] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const actions = useCategoryBudgetActions(userId)
  const form = useForm<CategoryBudgetFormValues>({ resolver: zodResolver(categoryBudgetSchema), defaultValues: { categoryId: '', amount: 0 } })
  const budgetedIds = useMemo(() => new Set(overview.categoryBudgets.map((item) => item.categoryId)), [overview.categoryBudgets])
  const availableCategories = useMemo(() => categories.filter((category) => category.active && category.type === 'expense' && (!budgetedIds.has(category.id) || category.id === editing?.categoryId)), [budgetedIds, categories, editing?.categoryId])
  const orderedBudgets = useMemo(() => [...overview.categoryBudgets].sort((left, right) => (getBudgetUsage(right.spent, right.amount)?.percentage ?? 0) - (getBudgetUsage(left.spent, left.amount)?.percentage ?? 0)), [overview.categoryBudgets])
  const showingForm = adding || Boolean(editing)

  useEffect(() => {
    if (!showingForm) return
    form.reset({ categoryId: editing?.categoryId ?? availableCategories[0]?.id ?? '', amount: editing?.amount ?? 0 })
    setSaveError(null)
  }, [availableCategories, editing, form, showingForm])

  const closeForm = () => { setAdding(false); setEditing(null); setSaveError(null) }
  const submit = form.handleSubmit(async (values) => {
    if (!overview.budget) return
    try {
      setSaveError(null)
      await actions.upsert.mutateAsync({ monthlyBudgetId: overview.budget.id, ...values })
      closeForm()
    } catch {
      setSaveError('No pudimos guardar este presupuesto por categoría.')
    }
  })

  const remove = async (item: CategoryBudgetOverview) => {
    if (!window.confirm(`¿Quitar el presupuesto de ${item.categoryName}?`)) return
    try { await actions.remove.mutateAsync(item.id) } catch { setSaveError('No pudimos quitar este presupuesto.') }
  }

  return <section aria-label="Presupuesto por categoría" className="mt-8 border-t border-[var(--border-subtle)] pt-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-[var(--foreground)]">Por categoría</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Los límites más exigidos aparecen primero.</p></div><Button disabled={availableCategories.length === 0 && !editing} onClick={() => setAdding(true)} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-3.5" />Agregar categoría</Button></div>{showingForm ? <form className="mt-5 grid gap-4 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end" onSubmit={(event) => void submit(event)}><Select {...form.register('categoryId')} disabled={Boolean(editing)} error={form.formState.errors.categoryId?.message} label="Categoría"><option value="">Selecciona</option>{availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select><Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Límite" min="0" step="0.01" type="number" /><div className="flex gap-2"><Button loading={actions.upsert.isPending} size="sm" type="submit">Guardar</Button><Button onClick={closeForm} size="sm" type="button" variant="ghost">Cancelar</Button></div>{saveError ? <p className="text-sm text-rose-600 sm:col-span-3 dark:text-rose-300">{saveError}</p> : null}</form> : null}{orderedBudgets.length === 0 ? <p className="mt-5 border-y border-[var(--border-subtle)] py-5 text-sm text-[var(--foreground-muted)]">Aún no definiste límites por categoría.</p> : <div className="mt-5 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">{orderedBudgets.map((item) => { const usage = getBudgetUsage(item.spent, item.amount); return <article className="py-4" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[var(--foreground)]">{item.categoryName}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{formatCurrency(item.spent, currency)} de {formatCurrency(item.amount, currency)}</p></div><div className="flex items-center gap-1"><span className="text-sm font-bold text-[var(--foreground)]">{usage ? `${usage.percentage}%` : 'Sin límite'}</span><Button aria-label={`Editar presupuesto de ${item.categoryName}`} onClick={() => { setAdding(false); setEditing(item) }} size="sm" type="button" variant="ghost">Editar</Button><Button aria-label={`Quitar presupuesto de ${item.categoryName}`} loading={actions.remove.isPending} onClick={() => void remove(item)} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5 text-rose-600" /></Button></div></div><div aria-label={`${usage?.percentage ?? 0}% del límite de ${item.categoryName} utilizado`} className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]"><div className={`h-full rounded-full ${getBudgetUsageStateClass(usage?.state ?? 'normal')}`} style={{ width: `${Math.min(usage?.percentage ?? 0, 100)}%` }} /></div></article> })}</div>}{saveError && !showingForm ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{saveError}</p> : null}</section>
}