import type { ReactNode } from 'react'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { Sidebar } from '@/components/layout/sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] lg:pl-64">
      <Sidebar />
      {children}
      <BottomNavigation />
    </div>
  )
}
