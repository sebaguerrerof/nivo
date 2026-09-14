import { Bell, CheckCheck, ChevronRight } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'
import { cn } from '@/lib/utils'

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' }).format(new Date(value))
}

export function NotificationButton({ className }: { className?: string }) {
  const { user } = useAuth()
  const { notifications, markRead, markAllRead } = useNotifications(user?.id)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const items = notifications.data ?? []
  const unreadCount = items.filter((item) => !item.read_at).length

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return <div className={cn('relative', className)}>{open ? <button aria-label="Cerrar notificaciones" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} type="button" /> : null}<Button aria-controls={panelId} aria-expanded={open} aria-haspopup="dialog" aria-label={unreadCount ? `${unreadCount} notificaciones sin leer` : 'Abrir notificaciones'} className="relative z-50" onClick={() => setOpen((value) => !value)} size="icon" type="button" variant="ghost"><Bell aria-hidden="true" className="size-4" />{unreadCount ? <span aria-hidden="true" className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-rose-600 text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}</Button>{open ? <section aria-label="Notificaciones" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-elevated)]" id={panelId} role="dialog"><div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3"><div><p className="font-semibold text-[var(--foreground)]">Notificaciones</p><p className="text-xs text-[var(--foreground-muted)]">Solo recordatorios dentro de Nivo.</p></div>{unreadCount ? <Button loading={markAllRead.isPending} onClick={() => void markAllRead.mutateAsync()} size="sm" type="button" variant="ghost"><CheckCheck aria-hidden="true" className="size-3.5" />Leer todo</Button> : null}</div><div className="max-h-[min(28rem,70vh)] overflow-y-auto">{notifications.isLoading ? <p className="p-5 text-sm text-[var(--foreground-muted)]">Cargando recordatorios…</p> : null}{!notifications.isLoading && items.length === 0 ? <p className="p-5 text-sm leading-6 text-[var(--foreground-muted)]">No tienes recordatorios por ahora. Cuando haya algo importante, aparecerá aquí.</p> : null}{items.map((item) => <article className={cn('border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0', !item.read_at && 'bg-teal-50/50 dark:bg-teal-950/20')} key={item.id}><div className="flex gap-3"><span aria-hidden="true" className={cn('mt-1.5 size-2 shrink-0 rounded-full', item.read_at ? 'bg-transparent' : 'bg-teal-600')} /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p><p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">{item.message}</p><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-[var(--foreground-subtle)]">{formatNotificationDate(item.created_at)}</span>{item.action_path ? <Link className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300" onClick={() => { if (!item.read_at) void markRead.mutateAsync(item.id); setOpen(false) }} to={item.action_path}>Ver<ChevronRight aria-hidden="true" className="size-3" /></Link> : null}</div></div></div></article>)}</div></section> : null}</div>
}