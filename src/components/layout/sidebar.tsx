import { NavLink } from 'react-router-dom'
import { NivoLogo } from '@/components/brand/nivo-logo'
import { isNavigationPathActive, sidebarNavigation } from '@/components/layout/navigation'

const primaryLabels = new Set(['Inicio', 'Hoy', 'Progreso'])
const financeLabels = new Set(['Finanzas', 'Pagos'])

type SidebarItem = (typeof sidebarNavigation)[number]

function SidebarLink({ label, href, icon: Icon }: SidebarItem) {
  if (!href) return null

  return <NavLink activeClassName="active" className="nivo-sidebar-item group flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nav-item-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-background)]" isActive={(_, location) => isNavigationPathActive(location.pathname, href)} to={href}><Icon aria-hidden="true" className="nivo-sidebar-icon size-[18px] shrink-0 transition-colors duration-200" />{label}</NavLink>
}

function NavigationGroup({ items, className }: { items: SidebarItem[]; className?: string }) {
  return <div className={className ?? 'grid gap-1'}>{items.map((item) => <SidebarLink {...item} key={item.label} />)}</div>
}

export function Sidebar() {
  const primary = sidebarNavigation.filter((item) => primaryLabels.has(item.label))
  const finance = sidebarNavigation.filter((item) => financeLabels.has(item.label))
  const settings = sidebarNavigation.filter((item) => item.label === 'Configuración')

  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-[var(--chrome-border)] bg-[var(--sidebar-background)] px-3 py-5 lg:flex"><NivoLogo className="px-2" /><nav aria-label="Navegación principal" className="mt-8"><NavigationGroup items={primary} /><NavigationGroup className="mt-7 grid gap-1" items={finance} /><NavigationGroup className="mt-7 grid gap-1" items={settings} /></nav></aside>
}