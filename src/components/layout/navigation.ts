import { BarChart3, CalendarDays, CheckSquare2, CircleDollarSign, Home, Settings2, Sparkles, Target, WalletCards } from 'lucide-react'
import type { NavigationItem } from '@/types/navigation'

export const sidebarNavigation: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, available: true },
  { label: 'Mi día', href: '/today', icon: CheckSquare2, available: true },
  { label: 'Calendario', icon: CalendarDays, available: false },
  { label: 'Hábitos', icon: Target, available: false },
  { label: 'Progreso', icon: BarChart3, available: false },
  { label: 'Finanzas', icon: WalletCards, available: false },
  { label: 'Pagos', icon: CircleDollarSign, available: false },
  { label: 'Configuración', href: '/profile', icon: Settings2, available: true },
]

export const mobileNavigation: NavigationItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: Home, available: true },
  { label: 'Hoy', href: '/today', icon: CheckSquare2, available: true },
  { label: 'Crear', href: '/today', icon: Sparkles, available: true },
  { label: 'Finanzas', icon: WalletCards, available: false },
  { label: 'Perfil', href: '/profile', icon: Settings2, available: true },
]