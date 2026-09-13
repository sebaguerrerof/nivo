import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatWeekStart } from '@/features/progress/progress.utils'
import type { XpTimelinePoint } from '@/features/progress/progress.types'

export function XpChart({ points, total }: { points: XpTimelinePoint[]; total: number }) {
  const data = points.map((point) => ({ ...point, label: formatWeekStart(point.weekStart).replace('Semana del ', '') }))

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><Sparkles aria-hidden="true" className="size-4" /></div><div><h2 className="font-bold text-[var(--foreground)]">XP ganado</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Experiencia registrada por semana.</p></div></div><p className="text-xl font-bold text-[var(--foreground)]">{total.toLocaleString('es-CL')} XP</p></div>
      {data.length ? <div className="mt-5 h-52" role="img" aria-label={`${total} XP obtenidos en el período`}><ResponsiveContainer height="100%" width="100%"><BarChart data={data} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="label" minTickGap={24} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }} /><Bar dataKey="xp" fill="var(--chart-accent)" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="mt-5 text-sm text-[var(--foreground-muted)]">Aún no hay XP registrado en este período.</p>}
    </Card>
  )
}