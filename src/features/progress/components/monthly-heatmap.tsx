import { useEffect, useMemo, useState } from 'react'
import { CalendarRange } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatProgressDate, getHeatmapLevel } from '@/features/progress/progress.utils'
import type { HeatmapDay } from '@/features/progress/progress.types'

function toDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(value: string, amount: number) {
  const date = toDate(value)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

function isoWeekday(value: string) {
  const day = toDate(value).getUTCDay()
  return day === 0 ? 7 : day
}

function getCalendarDays(startDate: string, endDate: string) {
  const first = addDays(startDate, -(isoWeekday(startDate) - 1))
  const last = addDays(endDate, 7 - isoWeekday(endDate))
  const days: string[] = []
  let cursor = first
  while (cursor <= last) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

function getHeatmapDescription(day: HeatmapDay | undefined, date: string) {
  if (!day) return `${formatProgressDate(date)}. Sin planificación.`
  return `${formatProgressDate(date)}. Daily Score: ${day.score}. ${day.completedActivities}/${day.plannedActivities} actividades, ${day.completedGoals}/${day.plannedGoals} objetivos. ${day.closed ? 'Día cerrado.' : 'Día sin cerrar.'}`
}

interface MonthlyHeatmapProps {
  heatmap: HeatmapDay[]
  startDate: string
  endDate: string
}

export function MonthlyHeatmap({ heatmap, startDate, endDate }: MonthlyHeatmapProps) {
  const byDate = useMemo(() => new Map(heatmap.map((day) => [day.date, day])), [heatmap])
  const calendarDays = useMemo(() => getCalendarDays(startDate, endDate), [startDate, endDate])
  const defaultDate = heatmap.at(-1)?.date ?? endDate
  const [selectedDate, setSelectedDate] = useState(defaultDate)

  useEffect(() => setSelectedDate(defaultDate), [defaultDate])

  const selectedDay = byDate.get(selectedDate)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><CalendarRange aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Tu constancia</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Últimos 3 meses según tu Daily Score.</p></div></div>
      <div className="mt-5 grid grid-cols-[1rem_minmax(0,1fr)] gap-2"><div className="grid grid-rows-7 gap-1 text-[9px] leading-[0.75rem] text-[var(--foreground-subtle)]"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div className="grid auto-cols-fr grid-flow-col grid-rows-7 gap-1">{calendarDays.map((date) => { const day = byDate.get(date); const isInsideRange = date >= startDate && date <= endDate; const level = day ? getHeatmapLevel(day.score) : 0; return <button aria-label={getHeatmapDescription(day, date)} className={`aspect-square min-h-3 rounded-[3px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)] ${isInsideRange ? `heatmap-level-${level} hover:scale-110` : 'bg-transparent'}`} key={date} onClick={() => setSelectedDate(date)} title={getHeatmapDescription(day, date)} type="button" /> })}</div></div>
      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-[var(--foreground-subtle)]"><span>Menor intensidad</span><div aria-label="Escala de intensidad del Daily Score" className="flex gap-1"><span className="heatmap-level-0 size-3 rounded-[3px]" /><span className="heatmap-level-1 size-3 rounded-[3px]" /><span className="heatmap-level-2 size-3 rounded-[3px]" /><span className="heatmap-level-3 size-3 rounded-[3px]" /><span className="heatmap-level-4 size-3 rounded-[3px]" /></div><span>Mayor</span></div>
      <div aria-live="polite" className="mt-5 rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--foreground-muted)]">{getHeatmapDescription(selectedDay, selectedDate)}</div>
    </Card>
  )
}