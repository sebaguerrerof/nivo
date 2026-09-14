import { describe, expect, it } from 'vitest'
import { getCurrentSectionTitle, sidebarNavigation } from '@/components/layout/navigation'
import { getUserInitials } from '@/components/layout/user-menu.utils'

describe('app navigation presentation', () => {
  it('uses concise section names for the top bar', () => {
    expect(getCurrentSectionTitle('/dashboard')).toBe('Inicio')
    expect(getCurrentSectionTitle('/today?date=2026-09-14')).toBe('Hoy')
    expect(getCurrentSectionTitle('/finances')).toBe('Finanzas')
    expect(getCurrentSectionTitle('/missing')).toBe('Nivo')
  })

  it('keeps the sidebar limited to available MVP destinations', () => {
    expect(sidebarNavigation.map((item) => item.label)).toEqual(['Inicio', 'Hoy', 'Progreso', 'Finanzas', 'Pagos', 'Configuración'])
  })

  it('builds a safe avatar fallback when profile names are incomplete', () => {
    expect(getUserInitials('Seba', 'Guerrero')).toBe('SG')
    expect(getUserInitials(null, null, 'nivo')).toBe('NI')
  })
})