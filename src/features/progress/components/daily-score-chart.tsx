import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatChartDate } from '@/features/progress/progress.utils'
import type { DailyScorePoint } from '@/features/progress/progress.types'

export function DailyScoreChart({ points }: { points: DailyScorePoint[] }) {
  const data = points.map((point) => ({ ...point, label: formatChartDate(point.date) }))

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><TrendingUp aria-hidden="true" className="size-4" /></div>
        <div>
          <h2 className="font-bold text-[var(--foreground)]">Evolución del Daily Score</h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">Tu score por cada día planificado del período.</p>
        </div>
      </div>
      <div className="mt-5 h-60" role="img" aria-label={`Evolución del Daily Score con ${points.length} días registrados`}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="label" minTickGap={26} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} />
            <YAxis axisLine={false} domain={[0, 100]} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} ticks={[0, 25, 50, 75, 100]} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--foreground-muted)' }} />
            <Line activeDot={{ r: 5, fill: 'var(--chart-primary)', stroke: 'var(--surface)' }} dataKey="score" dot={{ r: 3, fill: 'var(--chart-primary)', strokeWidth: 0 }} name="Daily Score" stroke="var(--chart-primary)" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-[var(--foreground-subtle)]">Daily Score del período: {points.length ? `${points[points.length - 1].score}/100 en el último día registrado.` : 'sin registros.'}</p>
    </Card>
  )
}