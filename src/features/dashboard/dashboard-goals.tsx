import { Check, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { DailyGoal } from '@/types/planning'

interface DashboardGoalsProps {
  date: string
  goals: DailyGoal[]
  isWorking?: boolean
  onToggle: (goal: DailyGoal) => Promise<unknown>
}

export function DashboardGoals({ date, goals, isWorking = false, onToggle }: DashboardGoalsProps) {
  return <section aria-label="Objetivos de hoy" className="border-t border-[var(--border-subtle)] pt-5 sm:pt-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">Objetivos de hoy</p><h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[var(--foreground)]">Lo importante primero</h2></div><span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground-muted)]">{goals.filter((goal) => goal.completed).length}/{goals.length}</span></div>{goals.length ? <ul className="mt-4 divide-y divide-[var(--border-subtle)]">{goals.map((goal) => <li className="flex min-h-12 items-center gap-3 py-2" key={goal.id}><button aria-label={goal.completed ? `Marcar ${goal.title} como pendiente` : `Completar ${goal.title}`} className={cn('grid size-8 shrink-0 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600', goal.completed ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border-strong)] text-transparent hover:border-teal-600')} disabled={isWorking} onClick={() => void onToggle(goal)} type="button"><Check aria-hidden="true" className="size-4" /></button><span className={cn('min-w-0 flex-1 text-sm font-medium text-[var(--foreground)]', goal.completed && 'text-[var(--foreground-muted)] line-through')}>{goal.title}</span></li>)}</ul> : <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] px-4 py-4 text-sm leading-6 text-[var(--foreground-muted)]">Define hasta tres objetivos para orientar el día.</div>}<Link className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-300" to={`/today?date=${date}`}><Target aria-hidden="true" className="size-4" />{goals.length ? 'Editar objetivos' : 'Agregar objetivos'}</Link></section>
}