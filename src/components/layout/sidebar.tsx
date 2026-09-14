import { NavLink } from 'react-router-dom'
import { NivoLogo } from '@/components/brand/nivo-logo'
import { sidebarNavigation } from '@/components/layout/navigation'

const primaryLabels = new Set(['Inicio', 'Hoy', 'Progreso'])
const financeLabels = new Set(['Finanzas', 'Pagos'])

function SidebarLink({ label, href, icon: Icon }: (typeof sidebarNavigation)[number]) {
  if (!href) return null
  return <NavLink activeClassName="bg-teal-50 text-teal-800 dark:bg-teal-950/45 dark:text-teal-200" className="flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]" to={href}><Icon aria-hidden="true" className="size-4" />{label}</NavLink>
}

export function Sidebar() {
  const primary = sidebarNavigation.filter((item) => primaryLabels.has(item.label))
  const finance = sidebarNavigation.filter((item) => financeLabels.has(item.label))
  const settings = sidebarNavigation.filter((item) => item.label === 'Configuración')

  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-[var(--border-subtle)] bg-[var(--canvas)] px-3 py-5 lg:flex"><NivoLogo className="px-2" /><nav aria-label="Navegación principal" className="mt-10 grid gap-1">{primary.map((item) => <SidebarLink {...item} key={item.label} />)}<div aria-hidden="true" className="my-3 h-px bg-[var(--border-subtle)]" />{finance.map((item) => <SidebarLink {...item} key={item.label} />)}<div aria-hidden="true" className="my-3 h-px bg-[var(--border-subtle)]" />{settings.map((item) => <SidebarLink {...item} key={item.label} />)}</nav></aside>
}