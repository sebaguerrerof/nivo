import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatCurrency, formatFinanceMonth, formatTransactionDate, groupTransactionsByDate } from '@/features/finances/finance.utils'
import type { FinanceMonth, FinancialCategory, FinancialTransaction, FinancialTransactionType, TransactionFilters } from '@/features/finances/finance.types'
import type { Currency } from '@/types/profile'

interface TransactionListProps {
  transactions: FinancialTransaction[]
  categories: FinancialCategory[]
  filters: TransactionFilters
  period: FinanceMonth
  timezone: string
  currency: Currency
  deletingId?: string
  onFiltersChange: (filters: TransactionFilters) => void
  onAddExpense: () => void
  onAddIncome: () => void
  onEdit: (transaction: FinancialTransaction) => void
  onDelete: (transaction: FinancialTransaction) => void
}

const filterOptions: Array<{ label: string; value: FinancialTransactionType | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Gastos', value: 'expense' },
  { label: 'Ingresos', value: 'income' },
]

function TransactionActions({ transaction, deleting, onEdit, onDelete }: { transaction: FinancialTransaction; deleting: boolean; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return <div className="relative shrink-0"><button aria-expanded={open} aria-label={`Acciones para ${transaction.description}`} className="grid size-9 place-items-center rounded-[0.75rem] text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-item-focus)]" onClick={() => setOpen((value) => !value)} type="button"><MoreHorizontal aria-hidden="true" className="size-4" /></button>{open ? <div className="absolute right-0 top-10 z-10 grid min-w-32 gap-1 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1.5 shadow-[var(--shadow-elevated)]" role="menu"><Button className="justify-start" onClick={() => { setOpen(false); onEdit() }} size="sm" type="button" variant="ghost"><Pencil aria-hidden="true" className="size-3.5" />Editar</Button><Button className="justify-start text-rose-700 hover:text-rose-800 dark:text-rose-300" loading={deleting} onClick={() => { setOpen(false); onDelete() }} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5" />Eliminar</Button></div> : null}</div>
}

export function TransactionList({ transactions, categories, filters, period, timezone, currency, deletingId, onFiltersChange, onAddExpense, onAddIncome, onEdit, onDelete }: TransactionListProps) {
  const groups = groupTransactionsByDate(transactions)
  const selectedMonth = formatFinanceMonth(period).toLocaleLowerCase('es-CL')

  return (
    <section aria-label="Movimientos recientes">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Movimientos recientes</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[var(--foreground)]">Lo que movió tu mes</h2><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Ingresos y gastos, ordenados para que encuentres lo importante rápido.</p></div><div className="w-full sm:w-52"><Select label="Categoría" onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value || undefined })} value={filters.categoryId ?? ''}><option value="">Todas las categorías</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.active ? '' : ' · Inactiva'}</option>)}</Select></div></div>
      <div className="mt-5 flex flex-wrap gap-1 rounded-full bg-[var(--surface-subtle)] p-1"><span className="sr-only">Filtrar movimientos</span>{filterOptions.map((option) => <button aria-pressed={filters.type === option.value} className={`min-h-9 rounded-full px-3.5 text-xs font-semibold transition ${filters.type === option.value ? 'bg-teal-700 text-white shadow-sm' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`} key={option.value} onClick={() => onFiltersChange({ ...filters, type: option.value })} type="button">{option.label}</button>)}</div>
      {transactions.length === 0 ? <div className="mt-6 border-y border-[var(--border-subtle)] py-10 text-center"><p className="font-semibold text-[var(--foreground)]">Todavía no hay movimientos en {selectedMonth}.</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Registra tu primer gasto o ingreso para empezar a entender el mes.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><Button onClick={onAddExpense} size="sm" type="button"><Plus aria-hidden="true" className="size-3.5" />Agregar gasto</Button><Button onClick={onAddIncome} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-3.5" />Agregar ingreso</Button></div></div> : <div className="mt-6 grid gap-7">{Object.entries(groups).map(([date, items]) => <section key={date}><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">{formatTransactionDate(date, timezone)}</h3><div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">{items.map((transaction) => { const isExpense = transaction.type === 'expense'; return <article className="flex min-w-0 items-center gap-3 py-4 sm:gap-4" key={transaction.id}><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${isExpense ? 'bg-rose-500' : 'bg-emerald-500'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--foreground)]">{transaction.description}</p><p className="mt-1 truncate text-xs text-[var(--foreground-muted)]">{transaction.category?.name ?? 'Sin categoría'} · {formatTransactionDate(transaction.transaction_date, timezone)}</p></div><p className={`shrink-0 text-right text-sm font-bold tabular-nums ${isExpense ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{isExpense ? '−' : '+'}{formatCurrency(transaction.amount, currency)}</p><TransactionActions deleting={deletingId === transaction.id} onDelete={() => onDelete(transaction)} onEdit={() => onEdit(transaction)} transaction={transaction} /></article> })}</div></section>)}</div>}
    </section>
  )
}