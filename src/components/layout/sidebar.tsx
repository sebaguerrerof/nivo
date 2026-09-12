import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NivoLogo } from '@/components/brand/nivo-logo'
import { Button } from '@/components/ui/button'
import { sidebarNavigation } from '@/components/layout/navigation'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'

export function Sidebar() {
  const { signOut, user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const name = profile?.first_name || user?.user_metadata.first_name || 'Mi cuenta'

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 lg:flex">
      <NivoLogo className="px-2" />
      <nav aria-label="Navegación principal" className="mt-10 grid gap-1">
        {sidebarNavigation.map(({ label, href, icon: Icon, available }) =>
          available && href ? (
            <NavLink
              activeClassName="bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200"
              className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              key={label}
              to={href}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </NavLink>
          ) : (
            <span
              aria-disabled="true"
              className="flex min-h-10 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--foreground-subtle)]"
              key={label}
              title="Disponible en una próxima fase"
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide">Pronto</span>
            </span>
          ),
        )}
      </nav>
      <div className="mt-auto border-t border-[var(--border)] px-2 pt-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            {name.slice(0, 1).toLocaleUpperCase('es-CL')}
          </div>
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{name}</p>
        </div>
        <Button className="w-full justify-start" onClick={() => void signOut()} size="sm" variant="ghost">
          <LogOut aria-hidden="true" className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
