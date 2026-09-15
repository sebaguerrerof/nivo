import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, FileText, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { activityCategoryOptions, activityPriorityLabels } from '@/features/planning/planning.constants'
import { generatedPlanDraftSchema, planDraftPromptSchema, type PlanDraft, type PlanDraftPromptValues } from '@/features/planning/plan-draft.schemas'
import { formatPlanDate, getNextCalendarDate } from '@/features/planning/planning.utils'
import type { ActivityCategory, ActivityPriority } from '@/types/planning'

interface PlanFromTextProps {
  date: string
  isSaving: boolean
  onDateChange: (date: string) => void
  onGenerate: (prompt: string) => Promise<PlanDraft>
  onSave: (draft: PlanDraft) => Promise<unknown>
  timezone: string
}


function asNullable(value: string) {
  const trimmed = value.trim()
  return trimmed || null
}

type EditablePlanField = 'wakeUpTime' | 'recoveryActivity' | 'responsibilities' | 'familyConnection' | 'mainRisk' | 'riskStrategy' | 'dailyCommitment' | 'notes'

export function PlanDraftReview({ draft, isSaving, onCancel, onSave }: { draft: PlanDraft; isSaving: boolean; onCancel: () => void; onSave: (draft: PlanDraft) => Promise<unknown> }) {
  const [editableDraft, setEditableDraft] = useState<PlanDraft>(draft)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEditableDraft(draft)
    setError(null)
  }, [draft])

  const updateField = (field: EditablePlanField, value: string) => {
    setEditableDraft((current) => ({ ...current, [field]: asNullable(value) }) as PlanDraft)
  }

  const updateGoal = (index: number, value: string) => {
    setEditableDraft((current) => ({ ...current, goals: current.goals.map((goal, goalIndex) => (goalIndex === index ? value : goal)) }))
  }

  const removeGoal = (index: number) => {
    setEditableDraft((current) => ({ ...current, goals: current.goals.filter((_, goalIndex) => goalIndex !== index) }))
  }

  const updateActivity = (index: number, patch: Partial<PlanDraft['activities'][number]>) => {
    setEditableDraft((current) => ({
      ...current,
      activities: current.activities.map((activity, activityIndex) => (activityIndex === index ? { ...activity, ...patch } : activity)),
    }))
  }

  const removeActivity = (index: number) => {
    setEditableDraft((current) => ({ ...current, activities: current.activities.filter((_, activityIndex) => activityIndex !== index) }))
  }

  const submit = async () => {
    setError(null)
    const { date, ...draftContent } = editableDraft
    const parsed = generatedPlanDraftSchema.safeParse(draftContent)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Revisa los datos antes de guardar.')
      return
    }

    try {
      await onSave({ ...parsed.data, date })
    } catch {
      setError('No pudimos guardar este plan. Revisa que no exista otro plan para esta fecha e inténtalo nuevamente.')
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300"><Check aria-hidden="true" className="size-4" />Borrador listo para revisar</div>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Confirma lo que quieres guardar.</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Nada se agrega a tu día hasta que pulses “Guardar este plan”.</p>
        </div>
        <Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="ghost">Empezar de nuevo</Button>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="draft-wake-up" label="Hora de despertar" onChange={(event) => updateField('wakeUpTime', event.target.value)} type="time" value={editableDraft.wakeUpTime ?? ''} />
        <Textarea id="draft-commitment" label="Compromiso personal" onChange={(event) => updateField('dailyCommitment', event.target.value)} rows={2} value={editableDraft.dailyCommitment ?? ''} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea id="draft-recovery" label="Recuperación obligatoria" onChange={(event) => updateField('recoveryActivity', event.target.value)} rows={3} value={editableDraft.recoveryActivity ?? ''} />
        <Textarea id="draft-responsibilities" label="Responsabilidades" onChange={(event) => updateField('responsibilities', event.target.value)} rows={3} value={editableDraft.responsibilities ?? ''} />
        <Textarea id="draft-family" label="Familia o personas" onChange={(event) => updateField('familyConnection', event.target.value)} rows={3} value={editableDraft.familyConnection ?? ''} />
        <Textarea id="draft-risk" label="Riesgo principal" onChange={(event) => updateField('mainRisk', event.target.value)} rows={3} value={editableDraft.mainRisk ?? ''} />
        <Textarea className="sm:col-span-2" id="draft-risk-strategy" label="Cómo lo enfrentarás" onChange={(event) => updateField('riskStrategy', event.target.value)} rows={3} value={editableDraft.riskStrategy ?? ''} />
      </div>

      <section className="grid gap-3 border-t border-[var(--border)] pt-5">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-[var(--foreground)]">Tres objetivos principales</h3><p className="mt-0.5 text-sm text-[var(--foreground-muted)]">Puedes ajustar, quitar o agregar hasta tres.</p></div>{editableDraft.goals.length < 3 ? <Button onClick={() => setEditableDraft((current) => ({ ...current, goals: [...current.goals, 'Nuevo objetivo'] }))} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-3.5" />Agregar</Button> : null}</div>
        {editableDraft.goals.length === 0 ? <p className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground-muted)]">No hay objetivos aún. Puedes agregarlos si quieres.</p> : null}
        {editableDraft.goals.map((goal, index) => <div className="flex items-end gap-2" key={`goal-${index}`}><Input id={`draft-goal-${index}`} label={`Objetivo ${index + 1}`} onChange={(event) => updateGoal(index, event.target.value)} value={goal} /><Button aria-label={`Eliminar objetivo ${index + 1}`} onClick={() => removeGoal(index)} size="icon" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button></div>)}
      </section>

      <section className="grid gap-4 border-t border-[var(--border)] pt-5">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-[var(--foreground)]">Actividades programadas</h3><p className="mt-0.5 text-sm text-[var(--foreground-muted)]">Revisa horarios y categorías antes de guardar.</p></div>{editableDraft.activities.length < 30 ? <Button onClick={() => setEditableDraft((current) => ({ ...current, activities: [...current.activities, { title: 'Nueva actividad', description: null, category: 'personal', startTime: null, endTime: null, priority: 'normal' }] }))} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-3.5" />Agregar</Button> : null}</div>
        {editableDraft.activities.length === 0 ? <p className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--foreground-muted)]">No hay actividades todavía. Puedes agregarlas manualmente.</p> : null}
        {editableDraft.activities.map((activity, index) => <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/45 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_9rem_auto] sm:items-end" key={`activity-${index}`}><Input id={`draft-activity-title-${index}`} label="Actividad" onChange={(event) => updateActivity(index, { title: event.target.value })} value={activity.title} /><Input id={`draft-activity-start-${index}`} label="Inicio" onChange={(event) => updateActivity(index, { startTime: asNullable(event.target.value) })} type="time" value={activity.startTime ?? ''} /><Input id={`draft-activity-end-${index}`} label="Término" onChange={(event) => updateActivity(index, { endTime: asNullable(event.target.value) })} type="time" value={activity.endTime ?? ''} /><Select id={`draft-activity-category-${index}`} label="Categoría" onChange={(event) => updateActivity(index, { category: event.target.value as ActivityCategory })} value={activity.category}>{activityCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select><Button aria-label={`Eliminar actividad ${index + 1}`} onClick={() => removeActivity(index)} size="icon" type="button" variant="ghost"><Trash2 aria-hidden="true" className="size-4" /></Button><div className="sm:col-span-4"><Textarea id={`draft-activity-description-${index}`} label="Detalle (opcional)" onChange={(event) => updateActivity(index, { description: asNullable(event.target.value) })} rows={2} value={activity.description ?? ''} /></div><Select id={`draft-activity-priority-${index}`} label="Prioridad" onChange={(event) => updateActivity(index, { priority: event.target.value as ActivityPriority })} value={activity.priority}>{Object.entries(activityPriorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>)}
      </section>

      <Textarea id="draft-notes" label="Notas del día (opcional)" onChange={(event) => updateField('notes', event.target.value)} rows={3} value={editableDraft.notes ?? ''} />
      <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end"><Button disabled={isSaving} onClick={onCancel} type="button" variant="ghost">Cancelar</Button><Button loading={isSaving} onClick={submit} type="button">Guardar este plan</Button></div>
    </div>
  )
}

export function PlanFromText({ date, isSaving, onDateChange, onGenerate, onSave, timezone }: PlanFromTextProps) {
  const form = useForm<PlanDraftPromptValues>({ resolver: zodResolver(planDraftPromptSchema), defaultValues: { prompt: '' } })
  const [draft, setDraft] = useState<PlanDraft | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = form.handleSubmit(async (values) => {
    setError(null)
    setIsGenerating(true)
    try {
      setDraft(await onGenerate(values.prompt))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos preparar el borrador. Intenta nuevamente.')
    } finally {
      setIsGenerating(false)
    }
  })

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-12 -top-12 size-40 rounded-full bg-teal-100/65 blur-3xl dark:bg-teal-950/30" />
      <div className="relative">
        {draft ? <PlanDraftReview draft={draft} isSaving={isSaving} onCancel={() => { setDraft(null); setError(null); form.reset() }} onSave={async (confirmedDraft) => { await onSave(confirmedDraft); setDraft(null); form.reset() }} /> : <><div className="grid size-10 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Sparkles aria-hidden="true" className="size-5" /></div><div className="mt-4"><h2 className="text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Planificar con IA</h2><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Describe tu día con tus palabras o pega una planificación existente. Prepararemos un borrador para {formatPlanDate(date, timezone)}.</p></div>{error ? <div className="mt-4"><Alert variant="error">{error}</Alert></div> : null}<form className="mt-5 grid gap-4" noValidate onSubmit={submit}><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><Input label="Fecha a planificar" onChange={(event) => { if (event.target.value) onDateChange(event.target.value) }} type="date" value={date} /><Button className="shrink-0" onClick={() => onDateChange(getNextCalendarDate(date))} type="button" variant="secondary">Mañana</Button></div><Textarea error={form.formState.errors.prompt?.message} label="Tu planificación" placeholder="Mañana quiero levantarme a las 7:30, ir al gym, trabajar y tener terapia en la tarde…" rows={8} {...form.register('prompt')} /><div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm leading-5 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/35 dark:text-sky-100"><span className="inline-flex items-center gap-1 font-semibold"><FileText aria-hidden="true" className="size-4" />Privacidad</span><span className="block mt-1">El texto solo se envía al generar el borrador; Nivo no lo guarda. Revisa y confirma los datos antes de crear tu día.</span></div><Button className="w-full sm:w-auto" loading={isGenerating} type="submit"><Sparkles aria-hidden="true" className="size-4" />Generar borrador</Button></form></>}
      </div>
    </Card>
  )
}