import { describe, expect, it } from 'vitest'
import { getCurrentSectionTitle, isNavigationPathActive, sidebarNavigation } from '@/components/layout/navigation'
import { getUserInitials } from '@/components/layout/user-menu.utils'

describe('app navigation presentation', () => {
  it('uses concise section names for the top bar', () => {
    expect(getCurrentSectionTitle('/dashboard')).toBe('Inicio')
    expect(getCurrentSectionTitle('/today?date=2026-09-14')).toBe('Hoy')
    expect(getCurrentSectionTitle('/finances')).toBe('Finanzas')
    expect(getCurrentSectionTitle('/missing')).toBe('Nivo')
  })

  it('matches only the intended section while preserving query and subroute navigation', () => {
    expect(isNavigationPathActive('/today?date=2026-09-14', '/today')).toBe(true)
    expect(isNavigationPathActive('/finances/transactions', '/finances')).toBe(true)
    expect(isNavigationPathActive('/payments?quick=payment', '/payments')).toBe(true)
    expect(isNavigationPathActive('/finances-archive', '/finances')).toBe(false)
    expect(isNavigationPathActive('/profile', '/payments')).toBe(false)
  })

  it('keeps the sidebar limited to available MVP destinations', () => {
    expect(sidebarNavigation.map((item) => item.label)).toEqual(['Inicio', 'Hoy', 'Progreso', 'Finanzas', 'Pagos', 'Configuración'])
  })

  it('builds a safe avatar fallback when profile names are incomplete', () => {
    expect(getUserInitials('Seba', 'Guerrero')).toBe('SG')
    expect(getUserInitials(null, null, 'nivo')).toBe('NI')
  })
})