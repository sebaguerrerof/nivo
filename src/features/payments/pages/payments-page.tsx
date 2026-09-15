import { IonContent, IonPage } from '@ionic/react'
import { AlertCircle, CalendarClock, Pause, Play, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { FinanceMonthNavigator } from '@/features/finances/components/finance-month-navigator'
import { useFinancialCategories } from '@/features/finances/hooks/use-finances'
import { formatCurrency, formatFinanceMonth, getCurrentFinanceMonth } from '@/features/finances/finance.utils'
import { MarkPaymentSheet } from '@/features/payments/components/mark-payment-sheet'
import { PaymentOccurrenceList } from '@/features/payments/components/payment-occurrence-list'
import { RecurringPaymentSheet } from '@/features/payments/components/recurring-payment-sheet'
import { usePaymentActions, usePaymentOccurrences, useRecurringPayments } from '@/features/payments/hooks/use-payments'
import { getPaymentOccurrenceStatus } from '@/features/payments/payment.utils'
import type { PaymentOccurrence, RecurringPayment } from '@/features/payments/payment.types'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { useProfile } from '@/hooks/use-profile'

export function PaymentsPage() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const currency = profile?.currency || 'CLP'
  const [period, setPeriod] = useState(() => getCurrentFinanceMonth(timezone))
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null | undefined>(undefined)
  const [markingPayment, setMarkingPayment] = useState<PaymentOccurrence | null>(null)

  useEffect(() => { if (new URLSearchParams(location.search).get('quick') === 'payment') setEditingPayment(null) }, [location.search])
  const recurring = useRecurringPayments(user?.id, true)
  const occurrences = usePaymentOccurrences(user?.id, period)
  const categories = useFinancialCategories(user?.id, true)
  const actions = usePaymentActions(user?.id ?? '')
  const today = getTodayInTimeZone(timezone)
  const monthPayments = useMemo(() => occurrences.data ?? [], [occurrences.data])
  const openMonthPayments = useMemo(() => monthPayments.filter((payment) => !['paid', 'skipped'].includes(getPaymentOccurrenceStatus(payment, today))).sort((left, right) => left.due_date.localeCompare(right.due_date)), [monthPayments, today])
  const overduePayments = useMemo(() => openMonthPayments.filter((payment) => getPaymentOccurrenceStatus(payment, today) === 'overdue'), [openMonthPayments, today])
  const dueTodayPayments = useMemo(() => openMonthPayments.filter((payment) => getPaymentOccurrenceStatus(payment, today) === 'pending'), [openMonthPayments, today])
  const upcomingPayments = useMemo(() => openMonthPayments.filter((payment) => getPaymentOccurrenceStatus(payment, today) === 'upcoming'), [openMonthPayments, today])
  const history = useMemo(() => monthPayments.filter((payment) => ['paid', 'skipped'].includes(getPaymentOccurrenceStatus(payment, today))).sort((left, right) => right.due_date.localeCompare(left.due_date)), [monthPayments, today])
  const recurringPayments = recurring.data ?? []
  const activeRecurringPayments = recurringPayments.filter((payment) => payment.active)
  const pausedRecurringPayments = recurringPayments.filter((payment) => !payment.active)
  const remainingTotal = openMonthPayments.reduce((total, payment) => total + payment.amount, 0)
  const isLoading = recurring.isLoading || occurrences.isLoading || categories.isLoading
  const isError = recurring.isError || occurrences.isError || categories.isError
  const isEmpty = !recurringPayments.length && !monthPayments.length

  const undoPayment = async (payment: PaymentOccurrence) => {
    if (!window.confirm(`¿Deshacer el pago de “${payment.recurring_payment?.name ?? 'este pago'}”? Solo se eliminará el gasto automático creado por Nivo.`)) return
    try { await actions.undo.mutateAsync(payment.id) } catch { window.alert('No pudimos deshacer este pago. Intenta nuevamente.') }
  }
  const setActive = async (payment: RecurringPayment, active: boolean) => {
    try { await actions.setActive.mutateAsync({ paymentId: payment.id, active }) } catch { window.alert('No pudimos actualizar este pago. Intenta nuevamente.') }
  }
  const deletePayment = async (payment: RecurringPayment) => {
    if (!window.confirm(`¿Eliminar “${payment.name}” y sus registros asociados? Se borrarán sus ocurrencias y los gastos automáticos creados por Nivo. Esta acción no se puede deshacer.`)) return
    try { await actions.remove.mutateAsync(payment.id) } catch { window.alert('No pudimos eliminar este pago. Actualiza la página e intenta nuevamente.') }
  }
  const markProcessingId = actions.markPaid.variables?.occurrenceId
  const undoProcessingId = actions.undo.variables

  return <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10"><div className="mx-auto max-w-6xl"><header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[var(--foreground-muted)]">Compromisos claros, sin sorpresas</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Pagos</h1><p className="mt-2 max-w-2xl text-[15px] leading-6 text-[var(--foreground-muted)]">Mantén tus compromisos al día.</p></div><div className="flex flex-wrap items-center gap-3"><FinanceMonthNavigator onChange={setPeriod} value={period} /><Button onClick={() => setEditingPayment(null)} type="button"><Plus aria-hidden="true" className="size-4" />Nuevo pago</Button></div></header>{isError ? <Alert variant="error">No pudimos cargar tus pagos. Actualiza la página e inténtalo nuevamente.</Alert> : null}{isLoading ? <section className="grid gap-6"><div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface-muted)]" />{Array.from({ length: 3 }, (_, index) => <div className="h-28 animate-pulse border-t border-[var(--border)]" key={index} />)}</section> : <div className="grid gap-7">{isEmpty ? <section className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/45 px-5 py-10 text-center sm:px-8"><div className="mx-auto grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><ReceiptText aria-hidden="true" className="size-5" /></div><h2 className="mt-4 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Aún no tienes pagos recurrentes.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">Puedes comenzar con terapia, gimnasio, teléfono o arriendo. Nivo separará cada vencimiento de tus gastos comunes.</p><Button className="mt-5" onClick={() => setEditingPayment(null)} type="button"><Plus aria-hidden="true" className="size-4" />Crear mi primer pago</Button></section> : <><section className="grid gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-3 sm:p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">Por resolver</p><p className="mt-1 text-xl font-bold tabular-nums text-[var(--foreground)]">{formatCurrency(remainingTotal, currency)}</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">Vencidos</p><p className="mt-1 text-xl font-bold text-rose-700 dark:text-rose-300">{overduePayments.length}</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--foreground-subtle)]">Este mes</p><p className="mt-1 text-xl font-bold text-[var(--foreground)]">{monthPayments.length} <span className="text-sm font-medium text-[var(--foreground-muted)]">registros</span></p></div></section>{overduePayments.length ? <Alert variant="error"><AlertCircle aria-hidden="true" className="size-4" />Tienes pagos vencidos. Resolverlos actualizará tus finanzas automáticamente.</Alert> : null}<PaymentOccurrenceList currency={currency} emptyMessage="No tienes pagos vencidos." onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={overduePayments} processingId={markProcessingId ?? undoProcessingId} timezone={timezone} title="Vencidos" /><PaymentOccurrenceList currency={currency} emptyMessage="No hay vencimientos para hoy." onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={dueTodayPayments} processingId={markProcessingId ?? undoProcessingId} timezone={timezone} title="Hoy" /><PaymentOccurrenceList currency={currency} emptyMessage={`No hay pagos próximos en ${formatFinanceMonth(period).toLocaleLowerCase('es-CL')}.`} onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={upcomingPayments} processingId={markProcessingId ?? undoProcessingId} timezone={timezone} title="Próximos" /><PaymentOccurrenceList currency={currency} emptyMessage="Todavía no hay pagos registrados en este mes." onMarkPaid={setMarkingPayment} onUndo={(payment) => void undoPayment(payment)} payments={history} processingId={markProcessingId ?? undoProcessingId} timezone={timezone} title="Historial" /></>}<details className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-6"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--foreground)] marker:hidden"><CalendarClock aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-300" />Gestionar pagos recurrentes <span className="font-normal text-[var(--foreground-muted)]">({recurringPayments.length})</span></summary><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Pausar deja el historial intacto y detiene los próximos vencimientos.</p><div className="mt-5"><h2 className="text-sm font-semibold text-[var(--foreground)]">Activos</h2>{activeRecurringPayments.length ? <ul className="mt-2">{activeRecurringPayments.map((payment) => <RecurringPaymentRow key={payment.id} onDelete={deletePayment} onEdit={setEditingPayment} onSetActive={setActive} payment={payment} removing={actions.remove.isPending && actions.remove.variables === payment.id} saving={actions.setActive.isPending && actions.setActive.variables?.paymentId === payment.id} />)}</ul> : <p className="mt-2 text-sm text-[var(--foreground-muted)]">No tienes pagos activos.</p>}</div>{pausedRecurringPayments.length ? <div className="mt-5 border-t border-[var(--border)] pt-5"><h2 className="text-sm font-semibold text-[var(--foreground)]">Pausados</h2><ul className="mt-2">{pausedRecurringPayments.map((payment) => <RecurringPaymentRow key={payment.id} onDelete={deletePayment} onEdit={setEditingPayment} onSetActive={setActive} payment={payment} removing={actions.remove.isPending && actions.remove.variables === payment.id} saving={actions.setActive.isPending && actions.setActive.variables?.paymentId === payment.id} />)}</ul></div> : null}<Button className="mt-5" onClick={() => setEditingPayment(null)} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-3.5" />Agregar pago</Button></details></div>}</div></main>{editingPayment !== undefined ? <RecurringPaymentSheet categories={categories.data ?? []} onClose={() => setEditingPayment(undefined)} onSave={(input) => editingPayment ? actions.update.mutateAsync({ paymentId: editingPayment.id, input }) : actions.create.mutateAsync(input)} payment={editingPayment} saving={actions.create.isPending || actions.update.isPending} timezone={timezone} /> : null}<MarkPaymentSheet occurrence={markingPayment} onClose={() => setMarkingPayment(null)} onSave={(input) => actions.markPaid.mutateAsync({ occurrenceId: markingPayment?.id ?? '', input })} saving={actions.markPaid.isPending} timezone={timezone} /></IonContent></IonPage>
}

interface RecurringPaymentRowProps {
  onDelete: (payment: RecurringPayment) => Promise<void>
  onEdit: (payment: RecurringPayment) => void
  onSetActive: (payment: RecurringPayment, active: boolean) => Promise<void>
  payment: RecurringPayment
  removing: boolean
  saving: boolean
}

function RecurringPaymentRow({ onDelete, onEdit, onSetActive, payment, removing, saving }: RecurringPaymentRowProps) {
  return <li className="flex flex-col gap-3 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--foreground)]">{payment.name}</p><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${payment.active ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' : 'bg-[var(--surface-muted)] text-[var(--foreground-muted)]'}`}>{payment.active ? 'Activo' : 'Pausado'}</span></div><p className="mt-1 text-sm text-[var(--foreground-muted)]">{payment.category?.name ?? 'Sin categoría'} · próximo {payment.next_due_date}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => onEdit(payment)} size="sm" type="button" variant="ghost">Editar</Button><Button loading={saving} onClick={() => void onSetActive(payment, !payment.active)} size="sm" type="button" variant="secondary">{payment.active ? <><Pause aria-hidden="true" className="size-3.5" />Pausar</> : <><Play aria-hidden="true" className="size-3.5" />Reanudar</>}</Button><Button loading={removing} onClick={() => void onDelete(payment)} size="sm" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5 text-rose-600 dark:text-rose-300" />Eliminar</Button></div></li>
}