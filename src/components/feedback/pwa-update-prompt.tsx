import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

export function PwaUpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  if (!needRefresh[0]) return null
  return <aside aria-live="polite" className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-md rounded-2xl border border-teal-200 bg-[var(--surface)] p-4 shadow-xl dark:border-teal-900 lg:bottom-5"><div className="flex items-start gap-3"><RefreshCw aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-700 dark:text-teal-300" /><div className="min-w-0 flex-1"><p className="font-semibold text-[var(--foreground)]">Hay una nueva versión de Nivo.</p><p className="mt-1 text-sm leading-5 text-[var(--foreground-muted)]">Actualiza para tener las mejoras más recientes.</p></div><Button aria-label="Cerrar aviso de actualización" onClick={() => updateServiceWorker(false)} size="sm" type="button" variant="ghost"><X aria-hidden="true" className="size-4" /></Button></div><Button className="mt-4" onClick={() => updateServiceWorker(true)} size="sm" type="button">Actualizar ahora</Button></aside>
}