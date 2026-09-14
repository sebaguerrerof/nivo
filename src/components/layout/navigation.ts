import { BarChart3, CheckSquare2, CircleDollarSign, Home, Settings2, WalletCards } from 'lucide-react'
import type { NavigationItem } from '@/types/navigation'

export const sidebarNavigation: NavigationItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: Home, available: true },
  { label: 'Hoy', href: '/today', icon: CheckSquare2, available: true },
  { label: 'Progreso', href: '/progress', icon: BarChart3, available: true },
  { label: 'Finanzas', href: '/finances', icon: WalletCards, available: true },
  { label: 'Pagos', href: '/payments', icon: CircleDollarSign, available: true },
  { label: 'Configuración', href: '/profile', icon: Settings2, available: true },
]

export const mobileNavigation: NavigationItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: Home, available: true },
  { label: 'Hoy', href: '/today', icon: CheckSquare2, available: true },
  { label: 'Finanzas', href: '/finances', icon: WalletCards, available: true },
  { label: 'Progreso', href: '/progress', icon: BarChart3, available: true },
  { label: 'Perfil', href: '/profile', icon: Settings2, available: true },
]

const sectionTitles: Array<{ href: string; title: string }> = [
  { href: '/dashboard', title: 'Inicio' },
  { href: '/today', title: 'Hoy' },
  { href: '/progress', title: 'Progreso' },
  { href: '/finances', title: 'Finanzas' },
  { href: '/payments', title: 'Pagos' },
  { href: '/profile', title: 'Configuración' },
]

function normalizePath(pathname: string) {
  return pathname.split(/[?#]/, 1)[0] || '/'
}

export function isNavigationPathActive(pathname: string, href: string) {
  const currentPath = normalizePath(pathname)
  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export function getCurrentSectionTitle(pathname: string) {
  return sectionTitles.find((section) => isNavigationPathActive(pathname, section.href))?.title ?? 'Nivo'
}