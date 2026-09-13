import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { HeartPulse } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatChartDate } from '@/features/progress/progress.utils'
import type { MoodPoint } from '@/features/progress/progress.types'

export function MoodTrendChart({ points }: { points: MoodPoint[] }) {
  const data = points.map((point) => ({ ...point, label: formatChartDate(point.date) }))
  const hasEnoughData = points.length >= 3

  return <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"><HeartPulse aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">Ánimo</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Registros opcionales de cierre del día, sin interpretaciones.</p></div></div>{hasEnoughData ? <div className="mt-5 h-52" role="img" aria-label={`Tendencia de ánimo con ${points.length} registros`}><ResponsiveContainer height="100%" width="100%"><LineChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="label" minTickGap={26} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} domain={[1, 10]} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} ticks={[1, 3, 5, 7, 10]} /><Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }} /><Line activeDot={{ r: 5, fill: 'var(--chart-accent)', stroke: 'var(--surface)' }} dataKey="score" dot={{ r: 3, fill: 'var(--chart-accent)', strokeWidth: 0 }} stroke="var(--chart-accent)" strokeWidth={3} type="monotone" /></LineChart></ResponsiveContainer></div> : <p className="mt-5 text-sm text-[var(--foreground-muted)]">Necesitamos más registros para mostrar esta tendencia.</p>}</Card>
}