import { BarChart3, CalendarDays, CheckSquare2, CircleDollarSign, Home, Settings2, Sparkles, Target, WalletCards } from 'lucide-react'
import type { NavigationItem } from '@/types/navigation'

export const sidebarNavigation: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, available: true },
  { label: 'Mi día', icon: CheckSquare2, available: false },
  { label: 'Calendario', icon: CalendarDays, available: false },
  { label: 'Hábitos', icon: Target, available: false },
  { label: 'Progreso', icon: BarChart3, available: false },
  { label: 'Finanzas', icon: WalletCards, available: false },
  { label: 'Pagos', icon: CircleDollarSign, available: false },
  { label: 'Configuración', href: '/profile', icon: Settings2, available: true },
]

export const mobileNavigation: NavigationItem[] = [
  { label: 'Hoy', href: '/dashboard', icon: Home, available: true },
  { label: 'Plan', icon: CheckSquare2, available: false },
  { label: 'Crear', icon: Sparkles, available: false },
  { label: 'Finanzas', icon: WalletCards, available: false },
  { label: 'Perfil', href: '/profile', icon: Settings2, available: true },
]
