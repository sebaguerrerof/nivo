import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Target } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoalCard } from '@/features/planning/components/goal-card'
import { dailyGoalSchema, type DailyGoalFormValues } from '@/features/planning/planning.schemas'
import { getNextGoalPosition } from '@/features/planning/planning.utils'
import type { DailyGoal } from '@/types/planning'

interface GoalsSectionProps {
  goals: DailyGoal[]
  isWorking: boolean
  onCreate: (title: string, position: number) => Promise<unknown>
  onDelete: (goalId: string) => Promise<unknown>
  onReorder: (first: DailyGoal, second: DailyGoal) => Promise<unknown>
  onToggle: (goal: DailyGoal) => Promise<unknown>
  onUpdate: (goalId: string, title: string) => Promise<unknown>
}

export function GoalsSection({ goals, isWorking, onCreate, onDelete, onReorder, onToggle, onUpdate }: GoalsSectionProps) {
  const form = useForm<DailyGoalFormValues>({ resolver: zodResolver(dailyGoalSchema), defaultValues: { title: '' } })
  const [editingGoal, setEditingGoal] = useState<DailyGoal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const atLimit = goals.length >= 3

  const createGoal = form.handleSubmit(async ({ title }) => {
    setError(null)
    try {
      await onCreate(title, getNextGoalPosition(goals.map((goal) => goal.position)))
      form.reset()
    } catch { setError('No pudimos guardar este objetivo. Intenta nuevamente.') }
  })
  const editForm = useForm<DailyGoalFormValues>({ resolver: zodResolver(dailyGoalSchema) })
  const startEditing = (goal: DailyGoal) => { setEditingGoal(goal); editForm.reset({ title: goal.title }) }
  const saveEdit = editForm.handleSubmit(async ({ title }) => {
    if (!editingGoal) return
    setError(null)
    try { await onUpdate(editingGoal.id, title); setEditingGoal(null) } catch { setError('No pudimos actualizar este objetivo. Intenta nuevamente.') }
  })

  return <section aria-labelledby="goals-title" className="border-t border-[var(--border)] pt-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-teal-800 dark:text-teal-200"><Target aria-hidden="true" className="size-4" /><p className="text-sm font-semibold" id="goals-title">Objetivos del día</p></div><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Hasta tres cosas que realmente importen.</p></div><span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground-muted)]">{goals.length}/3</span></div>{error ? <div className="mt-4"><Alert variant="error">{error}</Alert></div> : null}{goals.length ? <ul className="mt-4">{goals.map((goal, index) => <GoalCard canMoveDown={index < goals.length - 1} canMoveUp={index > 0} goal={goal} isPending={isWorking} key={goal.id} onDelete={() => { if (window.confirm('¿Eliminar este objetivo?')) void onDelete(goal.id).catch(() => setError('No pudimos eliminar este objetivo.')) }} onEdit={() => startEditing(goal)} onMoveDown={() => void onReorder(goal, goals[index + 1]).catch(() => setError('No pudimos ordenar los objetivos.'))} onMoveUp={() => void onReorder(goal, goals[index - 1]).catch(() => setError('No pudimos ordenar los objetivos.'))} onToggle={() => void onToggle(goal).catch(() => setError('No pudimos actualizar este objetivo.'))} />)}</ul> : <p className="mt-4 border-y border-dashed border-[var(--border)] py-4 text-sm leading-6 text-[var(--foreground-muted)]">Todavía no tienes objetivos. Agrega el primero para darle dirección a tu día.</p>}{editingGoal ? <form className="mt-4 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/55 p-3" noValidate onSubmit={saveEdit}><Input autoFocus error={editForm.formState.errors.title?.message} label="Editar objetivo" {...editForm.register('title')} /><div className="flex gap-2"><Button loading={isWorking} size="sm" type="submit">Guardar</Button><Button onClick={() => setEditingGoal(null)} size="sm" type="button" variant="ghost">Cancelar</Button></div></form> : null}{!atLimit ? <form className="mt-4 flex items-end gap-2" noValidate onSubmit={createGoal}><div className="min-w-0 flex-1"><Input aria-label="Nuevo objetivo" error={form.formState.errors.title?.message} label="Agregar un objetivo" placeholder="Ej. Salir a caminar" {...form.register('title')} /></div><Button aria-label="Agregar objetivo" loading={isWorking} size="icon" type="submit"><Plus aria-hidden="true" className="size-4" /></Button></form> : <p className="mt-4 text-xs font-medium text-[var(--foreground-subtle)]">Ya definiste tus tres objetivos principales.</p>}</section>
}