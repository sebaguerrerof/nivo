import { BarChart3, CalendarDays, CheckSquare2, CircleDollarSign, Home, Settings2, Target, WalletCards } from 'lucide-react'
import type { NavigationItem } from '@/types/navigation'

export const sidebarNavigation: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, available: true },
  { label: 'Mi día', href: '/today', icon: CheckSquare2, available: true },
  { label: 'Calendario', icon: CalendarDays, available: false },
  { label: 'Hábitos', icon: Target, available: false },
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