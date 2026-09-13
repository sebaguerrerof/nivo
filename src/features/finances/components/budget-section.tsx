import { zodResolver } from '@hookform/resolvers/zod'
import { PiggyBank, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { categoryBudgetSchema, monthlyBudgetSchema, type CategoryBudgetFormValues, type MonthlyBudgetFormValues } from '@/features/finances/finance.schemas'
import { useCategoryBudgetActions, useMonthlyBudgetActions } from '@/features/finances/hooks/use-finances'
import { buildFinanceInsights, formatCurrency, getBudgetUsage, getBudgetUsageStateClass } from '@/features/finances/finance.utils'
import type { CategoryBudgetOverview, FinanceMonth, FinancialCategory, FinancialOverview } from '@/features/finances/finance.types'
import type { Currency } from '@/types/profile'

interface BudgetSectionProps {
  userId: string
  period: FinanceMonth
  currency: Currency
  categories: FinancialCategory[]
  overview: FinancialOverview
}

export function BudgetSection({ userId, period, currency, categories, overview }: BudgetSectionProps) {
  const [editingBudget, setEditingBudget] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const budgetMutation = useMonthlyBudgetActions(userId)
  const form = useForm<MonthlyBudgetFormValues>({ resolver: zodResolver(monthlyBudgetSchema), defaultValues: { amount: overview.budget?.amount ?? 0, savingsTarget: overview.budget?.savings_target ?? 0 } })
  const usage = getBudgetUsage(overview.expenseTotal, overview.budget?.amount ?? null)
  const insights = buildFinanceInsights(overview)

  useEffect(() => {
    form.reset({ amount: overview.budget?.amount ?? 0, savingsTarget: overview.budget?.savings_target ?? 0 })
  }, [form, overview.budget])

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
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.85fr)]">
      <Card className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><PiggyBank aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Presupuesto mensual</p></div><h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">{overview.budget ? 'Tu límite de gasto' : 'Define tu presupuesto'}</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">{overview.budget ? 'Un límite claro te ayuda a ver el ritmo de tu mes.' : 'Define un monto para saber cómo va tu gasto.'}</p></div><Button onClick={() => setEditingBudget((value) => !value)} size="sm" type="button" variant={overview.budget ? 'secondary' : 'primary'}>{editingBudget ? 'Cerrar' : overview.budget ? 'Editar' : 'Crear presupuesto'}</Button></div>
        {overview.budget && !editingBudget ? <div className="mt-6"><div className="flex items-end justify-between gap-4"><div><p className="text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]">{formatCurrency(overview.expenseTotal, currency)}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">de {formatCurrency(overview.budget.amount, currency)} presupuestados</p></div><p className="text-lg font-bold text-[var(--foreground)]">{usage?.percentage ?? 0}%</p></div><div aria-label={`${usage?.percentage ?? 0}% del presupuesto utilizado`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.min(usage?.percentage ?? 0, 100)} className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar"><div className={`h-full rounded-full ${getBudgetUsageStateClass(usage?.state ?? 'normal')}`} style={{ width: `${Math.min(usage?.percentage ?? 0, 100)}%` }} /></div><p className="mt-3 text-sm text-[var(--foreground-muted)]">{usage && usage.remaining >= 0 ? `Te quedan ${formatCurrency(usage.remaining, currency)} dentro del presupuesto.` : 'Has superado el límite que definiste para este mes.'}</p>{overview.budget.savings_target > 0 ? <p className="mt-1 text-xs text-[var(--foreground-subtle)]">Meta de ahorro: {formatCurrency(overview.budget.savings_target, currency)}</p> : null}</div> : null}
        {editingBudget ? <form className="mt-6 grid gap-4 border-t border-[var(--border)] pt-5" onSubmit={(event) => void submit(event)}><div className="grid gap-4 sm:grid-cols-2"><Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Presupuesto mensual" min="0" step="0.01" type="number" /><Input {...form.register('savingsTarget', { valueAsNumber: true })} error={form.formState.errors.savingsTarget?.message} inputMode="decimal" label="Meta de ahorro (opcional)" min="0" step="0.01" type="number" /></div>{saveError ? <p className="text-sm text-rose-600 dark:text-rose-300">{saveError}</p> : null}<div className="flex gap-3"><Button loading={budgetMutation.isPending} type="submit">Guardar presupuesto</Button><Button onClick={() => { setEditingBudget(false); setSaveError(null) }} type="button" variant="secondary">Cancelar</Button></div></form> : null}
      </Card>
      <Card className="p-5 sm:p-6"><div className="flex items-center gap-2 text-teal-700 dark:text-teal-300"><PiggyBank aria-hidden="true" className="size-4" /><p className="text-sm font-semibold">Disponible para gastar</p></div><p className={`mt-4 text-3xl font-bold tracking-[-0.05em] ${overview.safeToSpend.available < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-[var(--foreground)]'}`}>{formatCurrency(overview.safeToSpend.available, currency)}</p>{overview.safeToSpend.dailyAvailable === null ? <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">El mes seleccionado ya terminó; esta estimación diaria solo aplica a meses en curso o futuros.</p> : <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Aproximadamente <span className="font-semibold text-[var(--foreground)]">{formatCurrency(overview.safeToSpend.dailyAvailable, currency)} por día</span> durante los {overview.safeToSpend.daysRemaining} días restantes.</p>}<div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4"><div><p className="text-xs font-medium text-[var(--foreground-subtle)]">Dinero comprometido</p><p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">{formatCurrency(overview.committedPending, currency)}</p></div><div><p className="text-xs font-medium text-[var(--foreground-subtle)]">Disponible real estimado</p><p className="mt-1 text-sm font-bold text-[var(--foreground)]">{formatCurrency(overview.availableReal, currency)}</p></div></div><p className="mt-4 text-xs leading-5 text-[var(--foreground-subtle)]">Resta los pagos pendientes y tu meta de ahorro; los pagos confirmados no se descuentan dos veces. No es asesoría financiera.</p></Card>
      {overview.budget ? <CategoryBudgets categories={categories} currency={currency} overview={overview} userId={userId} /> : null}
      {insights.length > 0 ? <Card className="p-5 sm:p-6"><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Lectura del mes</p><ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--foreground-muted)]">{insights.map((insight) => <li className="rounded-xl bg-[var(--surface-muted)] px-3 py-2.5" key={insight}>{insight}</li>)}</ul></Card> : null}
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
  const availableCategories = useMemo(
    () => categories.filter((category) => category.active && category.type === 'expense' && (!budgetedIds.has(category.id) || category.id === editing?.categoryId)),
    [budgetedIds, categories, editing?.categoryId],
  )
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

  return <Card className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Presupuesto por categoría</p><h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Límites que realmente importan</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">No necesitas presupuestar todas las categorías.</p></div><Button disabled={availableCategories.length === 0 && !editing} onClick={() => setAdding(true)} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-4" />Agregar</Button></div>{showingForm ? <form className="mt-5 grid gap-4 rounded-2xl bg-[var(--surface-muted)] p-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end" onSubmit={(event) => void submit(event)}><Select {...form.register('categoryId')} disabled={Boolean(editing)} error={form.formState.errors.categoryId?.message} label="Categoría"><option value="">Selecciona</option>{availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select><Input {...form.register('amount', { valueAsNumber: true })} error={form.formState.errors.amount?.message} inputMode="decimal" label="Límite" min="0" step="0.01" type="number" /><div className="flex gap-2"><Button loading={actions.upsert.isPending} size="sm" type="submit">Guardar</Button><Button onClick={closeForm} size="sm" type="button" variant="ghost">Cancelar</Button></div>{saveError ? <p className="text-sm text-rose-600 sm:col-span-3 dark:text-rose-300">{saveError}</p> : null}</form> : null}{overview.categoryBudgets.length === 0 ? <div className="mt-5 rounded-2xl bg-[var(--surface-muted)] px-4 py-7 text-sm text-[var(--foreground-muted)]">Aún no definiste límites por categoría.</div> : <div className="mt-5 grid gap-4">{overview.categoryBudgets.map((item) => { const usage = getBudgetUsage(item.spent, item.amount); return <article className="rounded-xl border border-[var(--border)] p-4" key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[var(--foreground)]">{item.categoryName}</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">{formatCurrency(item.spent, currency)} de {formatCurrency(item.amount, currency)}</p></div><div className="flex items-center gap-1"><span className="text-sm font-bold text-[var(--foreground)]">{usage ? `${usage.percentage}%` : 'Sin límite'}</span><Button aria-label={`Editar presupuesto de ${item.categoryName}`} onClick={() => { setAdding(false); setEditing(item) }} size="sm" type="button" variant="ghost">Editar</Button><Button aria-label={`Quitar presupuesto de ${item.categoryName}`} loading={actions.remove.isPending} onClick={() => void remove(item)} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5 text-rose-600" /></Button></div></div><div aria-label={`${usage?.percentage ?? 0}% del límite de ${item.categoryName} utilizado`} className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className={`h-full rounded-full ${getBudgetUsageStateClass(usage?.state ?? 'normal')}`} style={{ width: `${Math.min(usage?.percentage ?? 0, 100)}%` }} /></div></article> })}</div>}</Card>
}
