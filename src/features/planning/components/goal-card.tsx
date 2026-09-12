import { Check, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <li className="flex min-h-14 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-sm">
      <button aria-label={goal.completed ? `Marcar ${goal.title} como pendiente` : `Completar ${goal.title}`} className={cn('grid size-7 shrink-0 place-items-center rounded-full border transition', goal.completed ? 'border-teal-600 bg-teal-600 text-white' : 'border-[var(--border)] text-transparent hover:border-teal-600')} disabled={isPending} onClick={onToggle} type="button">
        <Check aria-hidden="true" className="size-4" />
      </button>
      <span className={cn('min-w-0 flex-1 text-sm font-medium text-[var(--foreground)]', goal.completed && 'text-[var(--foreground-muted)] line-through')}>{goal.title}</span>
      <div className="flex shrink-0 items-center gap-0.5">
        <button aria-label="Mover objetivo hacia arriba" className="grid size-8 place-items-center rounded-lg text-[var(--foreground-subtle)] hover:bg-[var(--surface-muted)] disabled:opacity-30" disabled={!canMoveUp || isPending} onClick={onMoveUp} type="button"><ChevronUp aria-hidden="true" className="size-4" /></button>
        <button aria-label="Mover objetivo hacia abajo" className="grid size-8 place-items-center rounded-lg text-[var(--foreground-subtle)] hover:bg-[var(--surface-muted)] disabled:opacity-30" disabled={!canMoveDown || isPending} onClick={onMoveDown} type="button"><ChevronDown aria-hidden="true" className="size-4" /></button>
        <Button aria-label="Editar objetivo" disabled={isPending} onClick={onEdit} size="sm" variant="ghost"><Pencil aria-hidden="true" className="size-3.5" /></Button>
        <Button aria-label="Eliminar objetivo" disabled={isPending} onClick={onDelete} size="sm" variant="ghost"><Trash2 aria-hidden="true" className="size-3.5" /></Button>
      </div>
    </li>
  )
}
