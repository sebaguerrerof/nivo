import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { activityCategoryOptions, activityPriorityLabels } from '@/features/planning/planning.constants'
import { activitySchema, type ActivityFormValues } from '@/features/planning/planning.schemas'
import { getActivityTime, toActivityInstant } from '@/features/planning/planning.utils'
import type { Activity, ActivityInput } from '@/types/planning'

interface ActivityFormProps {
  activity?: Activity
  date: string
  isPending: boolean
  onCancel?: () => void
  onSubmit: (input: ActivityInput) => Promise<unknown>
  submitLabel: string
  timezone: string
}

export function ActivityForm({ activity, date, isPending, onCancel, onSubmit, submitLabel, timezone }: ActivityFormProps) {
  const [showMore, setShowMore] = useState(Boolean(activity?.description || activity?.end_at || activity?.priority === 'high' || activity?.priority === 'low'))
  const form = useForm<ActivityFormValues>({ resolver: zodResolver(activitySchema) })

  useEffect(() => {
    form.reset({
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      category: activity?.category ?? 'personal',
      startTime: getActivityTime(activity?.start_at ?? null, timezone) ?? '',
      endTime: getActivityTime(activity?.end_at ?? null, timezone) ?? '',
      priority: activity?.priority ?? 'normal',
      status: activity?.status ?? 'pending',
    })
  }, [activity, form, timezone])

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      description: values.description,
      category: values.category,
      startAt: toActivityInstant(date, values.startTime, timezone),
      endAt: toActivityInstant(date, values.endTime, timezone),
      priority: values.priority,
      status: values.status,
    })
  })

  return (
    <form className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5" noValidate onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem_10rem]">
        <Input autoFocus error={form.formState.errors.title?.message} label="Actividad" placeholder="¿Qué quieres hacer?" {...form.register('title')} />
        <Input error={form.formState.errors.startTime?.message} label="Hora" type="time" {...form.register('startTime')} />
        <Select error={form.formState.errors.category?.message} label="Categoría" {...form.register('category')}>{activityCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>
      </div>
      <button aria-expanded={showMore} className="flex w-fit items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-300" onClick={() => setShowMore((visible) => !visible)} type="button">Más opciones {showMore ? <ChevronUp aria-hidden="true" className="size-4" /> : <ChevronDown aria-hidden="true" className="size-4" />}</button>
      {showMore ? <div className="grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2"><Textarea className="sm:col-span-2" error={form.formState.errors.description?.message} label="Descripción (opcional)" rows={2} {...form.register('description')} /><Input error={form.formState.errors.endTime?.message} label="Hora de término" type="time" {...form.register('endTime')} /><Select error={form.formState.errors.priority?.message} label="Prioridad" {...form.register('priority')}>{Object.entries(activityPriorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div> : null}
      <input type="hidden" {...form.register('status')} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button disabled={isPending} onClick={onCancel} type="button" variant="ghost">Cancelar</Button><Button loading={isPending} type="submit">{submitLabel}</Button></div>
    </form>
  )
}
