import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatChartDate, getComparison } from '@/features/progress/progress.utils'
import type { DailyScorePoint, ProgressSummaryValues } from '@/features/progress/progress.types'

interface DailyScoreChartProps {
  points: DailyScorePoint[]
  current: ProgressSummaryValues
  previous: ProgressSummaryValues
}

export function DailyScoreChart({ points, current, previous }: DailyScoreChartProps) {
  const data = points.map((point) => ({ ...point, label: formatChartDate(point.date) }))
  const difference = getComparison(current.dailyScoreAverage, previous.dailyScoreAverage, current.plannedDays, previous.plannedDays)

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><TrendingUp aria-hidden="true" className="size-4" /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">Cómo han sido tus días</p><h2 className="mt-1 font-bold text-[var(--foreground)]">Daily Score promedio: {current.dailyScoreAverage ?? '—'}</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">{difference === null ? 'Aún no hay suficientes días para comparar.' : difference === 0 ? 'Se mantiene igual al período anterior.' : difference > 0 ? `Subió ${difference} puntos frente al período anterior.` : `Bajó ${Math.abs(difference)} puntos frente al período anterior.`}</p></div></div>
      <div className="mt-5 h-60" role="img" aria-label={`Evolución del Daily Score con ${points.length} días registrados`}><ResponsiveContainer height="100%" width="100%"><LineChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="label" minTickGap={26} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} /><YAxis axisLine={false} domain={[0, 100]} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} ticks={[0, 25, 50, 75, 100]} /><Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--foreground-muted)' }} /><Line activeDot={{ r: 5, fill: 'var(--chart-primary)', stroke: 'var(--surface)' }} dataKey="score" dot={{ r: 3, fill: 'var(--chart-primary)', strokeWidth: 0 }} name="Daily Score" stroke="var(--chart-primary)" strokeWidth={3} type="monotone" /></LineChart></ResponsiveContainer></div>
      <p className="mt-2 text-xs text-[var(--foreground-subtle)]">Daily Score del período: {points.length ? `${points[points.length - 1].score}/100 en el último día registrado.` : 'sin registros.'}</p>
    </Card>
  )
}