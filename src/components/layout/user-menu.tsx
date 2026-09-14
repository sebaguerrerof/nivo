import { LogOut, Moon, Settings2, Sun, UserRound } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme.store'
import { getUserInitials } from '@/components/layout/user-menu.utils'


export function UserMenu({ mobile = false }: { mobile?: boolean }) {
  const { signOut, user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const firstName = profile?.first_name || user?.user_metadata.first_name || null
  const lastName = profile?.last_name || user?.user_metadata.last_name || null
  const name = [firstName, lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Mi cuenta'
  const initials = getUserInitials(firstName, lastName, name)
  const useDarkTheme = preference !== 'dark'

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return <div className="relative">{open ? <button aria-label="Cerrar menú de usuario" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} type="button" /> : null}<button aria-controls={panelId} aria-expanded={open} aria-haspopup="menu" aria-label="Abrir menú de usuario" className={cn('relative z-50 grid size-10 place-items-center rounded-[10px] bg-teal-700 text-xs font-bold text-white shadow-sm shadow-teal-950/20 transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]', mobile && 'size-9')} onClick={() => setOpen((value) => !value)} type="button">{initials}</button>{open ? <section aria-label="Menú de usuario" className={cn('absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-2 shadow-[var(--shadow-elevated)]', mobile && 'fixed right-3 top-15')} id={panelId} role="menu"><div className="border-b border-[var(--border-subtle)] px-3 pb-3 pt-2"><p className="truncate text-sm font-semibold text-[var(--foreground)]">{name}</p>{user?.email ? <p className="mt-0.5 truncate text-xs text-[var(--foreground-muted)]">{user.email}</p> : null}</div><div className="grid gap-1 py-2"><Link className="flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]" onClick={() => setOpen(false)} role="menuitem" to="/profile"><UserRound aria-hidden="true" className="size-4" />Perfil y configuración</Link><button className="flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-left text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]" onClick={() => { setPreference(useDarkTheme ? 'dark' : 'light'); setOpen(false) }} role="menuitem" type="button">{useDarkTheme ? <Moon aria-hidden="true" className="size-4" /> : <Sun aria-hidden="true" className="size-4" />}{useDarkTheme ? 'Usar tema oscuro' : 'Usar tema claro'}</button><Link className="flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]" onClick={() => setOpen(false)} role="menuitem" to="/profile"><Settings2 aria-hidden="true" className="size-4" />Configuración</Link></div><div className="border-t border-[var(--border-subtle)] pt-2"><Button className="w-full justify-start" onClick={() => void signOut()} size="sm" type="button" variant="ghost"><LogOut aria-hidden="true" className="size-4" />Cerrar sesión</Button></div></section> : null}</div>
}