import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckSquare2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CompletionChartProps {
  planned: number
  completed: number
  percentage: number | null
}

export function CompletionChart({ planned, completed, percentage }: CompletionChartProps) {
  const data = [{ name: 'Planificadas', value: planned, fill: 'var(--chart-secondary)' }, { name: 'Completadas', value: completed, fill: 'var(--chart-primary)' }]

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><CheckSquare2 aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Cumplimiento de actividades</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">{completed} de {planned} actividades completadas.</p></div></div>
        <p className="text-2xl font-bold tracking-[-0.045em] text-[var(--foreground)]">{percentage === null ? '—' : `${percentage}%`}</p>
      </div>
      <div className="mt-5 h-44" role="img" aria-label={`${completed} de ${planned} actividades completadas`}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="name" tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }} />
            <Bar dataKey="value" fill="var(--chart-primary)" radius={[7, 7, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}