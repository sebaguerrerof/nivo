import { Check, ChevronDown, ChevronUp, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DailyGoal } from '@/types/planning'

interface GoalCardProps {
  goal: DailyGoal
  canMoveDown: boolean
  canMoveUp: boolean
  isPending?: boolean
  onDelete: () => void
  onEdit: () => void
  onMoveDown: () => void
  onMoveUp: () => void
  onToggle: () => void
}

export function GoalCard({ goal, canMoveDown, canMoveUp, isPending = false, onDelete, onEdit, onMoveDown, onMoveUp, onToggle }: GoalCardProps) {
  return (
    <li className="flex min-h-14 items-center gap-3 border-b border-[var(--border)] py-2.5 last:border-b-0">
      <button aria-label={goal.completed ? `Marcar ${goal.title} como pendiente` : `Completar ${goal.title}`} className={cn('grid size-9 shrink-0 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600', goal.completed ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border)] text-transparent hover:border-teal-600 hover:text-teal-600')} disabled={isPending} onClick={onToggle} type="button"><Check aria-hidden="true" className="size-4" /></button>
      <span className={cn('min-w-0 flex-1 text-sm font-medium leading-5 text-[var(--foreground)]', goal.completed && 'text-[var(--foreground-muted)] line-through')}>{goal.title}</span>
      <details className="relative shrink-0">
        <summary aria-label={`Más acciones para ${goal.title}`} className="grid size-10 cursor-pointer list-none place-items-center rounded-xl text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] marker:hidden"><MoreHorizontal aria-hidden="true" className="size-4" /></summary>
        <div className="absolute right-0 top-10 z-20 grid min-w-40 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
          <button className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] disabled:opacity-40" disabled={isPending} onClick={onEdit} type="button"><Pencil aria-hidden="true" className="size-3.5" />Editar</button>
          <button className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] disabled:opacity-40" disabled={!canMoveUp || isPending} onClick={onMoveUp} type="button"><ChevronUp aria-hidden="true" className="size-3.5" />Mover arriba</button>
          <button className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] disabled:opacity-40" disabled={!canMoveDown || isPending} onClick={onMoveDown} type="button"><ChevronDown aria-hidden="true" className="size-3.5" />Mover abajo</button>
          <button className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/50 disabled:opacity-40" disabled={isPending} onClick={onDelete} type="button"><Trash2 aria-hidden="true" className="size-3.5" />Eliminar</button>
        </div>
      </details>
    </li>
  )
}