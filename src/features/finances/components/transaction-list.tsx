import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { formatCurrency, formatTransactionDate, groupTransactionsByDate } from '@/features/finances/finance.utils'
import type { FinancialCategory, FinancialTransaction, FinancialTransactionType, TransactionFilters } from '@/features/finances/finance.types'
import type { Currency } from '@/types/profile'

interface TransactionListProps {
  transactions: FinancialTransaction[]
  categories: FinancialCategory[]
  filters: TransactionFilters
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
  { label: 'Ingresos', value: 'income' },
  { label: 'Gastos', value: 'expense' },
]

export function TransactionList({ transactions, categories, filters, timezone, currency, deletingId, onFiltersChange, onAddExpense, onAddIncome, onEdit, onDelete }: TransactionListProps) {
  const groups = groupTransactionsByDate(transactions)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Movimientos</p><h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Actividad del mes</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Tus registros se ordenan por fecha para encontrarlos rápido.</p></div><div className="flex flex-wrap gap-2"><Button onClick={onAddExpense} size="sm" type="button"><Plus aria-hidden="true" className="size-4" />Gasto</Button><Button onClick={onAddIncome} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-4" />Ingreso</Button></div></div>
      <div className="mt-5 flex flex-col gap-3 border-y border-[var(--border)] py-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-wrap gap-2">{filterOptions.map((option) => <button className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition ${filters.type === option.value ? 'bg-teal-700 text-white' : 'bg-[var(--surface-muted)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`} key={option.value} onClick={() => onFiltersChange({ ...filters, type: option.value })} type="button">{option.label}</button>)}</div><div className="w-full sm:w-52"><Select label="Categoría" onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value || undefined })} value={filters.categoryId ?? ''}><option value="">Todas las categorías</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.active ? '' : ' · Inactiva'}</option>)}</Select></div></div>
      {transactions.length === 0 ? <div className="rounded-2xl bg-[var(--surface-muted)] px-5 py-10 text-center"><p className="font-semibold text-[var(--foreground)]">Todavía no tienes movimientos este mes.</p><p className="mt-1 text-sm text-[var(--foreground-muted)]">Registra un gasto o ingreso para empezar a entender tu mes.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><Button onClick={onAddExpense} size="sm" type="button">Agregar gasto</Button><Button onClick={onAddIncome} size="sm" type="button" variant="secondary">Agregar ingreso</Button></div></div> : <div className="mt-5 grid gap-6">{Object.entries(groups).map(([date, items]) => <section key={date}><h3 className="mb-2 text-sm font-semibold text-[var(--foreground-muted)]">{formatTransactionDate(date, timezone)}</h3><div className="overflow-hidden rounded-xl border border-[var(--border)]">{items.map((transaction) => { const isExpense = transaction.type === 'expense'; return <article className="flex items-center gap-3 border-b border-[var(--border)] px-3 py-3 last:border-b-0 sm:px-4" key={transaction.id}><span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${isExpense ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'}`}>{isExpense ? '−' : '+'}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--foreground)]">{transaction.description}</p><p className="mt-0.5 truncate text-xs text-[var(--foreground-muted)]">{transaction.category?.name ?? 'Sin categoría'}{transaction.payment_method ? ` · ${transaction.payment_method}` : ''}</p></div><p className={`shrink-0 text-sm font-bold ${isExpense ? 'text-rose-700 dark:text-rose-300' : 'text-teal-700 dark:text-teal-300'}`}>{isExpense ? '−' : '+'}{formatCurrency(transaction.amount, currency)}</p><div className="flex shrink-0"><Button aria-label={`Editar ${transaction.description}`} onClick={() => onEdit(transaction)} size="sm" type="button" variant="ghost"><Pencil aria-hidden="true" className="size-3.5" /></Button><Button aria-label={`Eliminar ${transaction.description}`} loading={deletingId === transaction.id} onClick={() => onDelete(transaction)} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5 text-rose-600 dark:text-rose-300" /></Button></div></article> })}</div></section>)}</div>}
    </Card>
  )
}
