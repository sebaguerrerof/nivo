import type { ReactNode } from 'react'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
import { OfflineBanner } from '@/components/feedback/offline-banner'
import { PwaUpdatePrompt } from '@/components/feedback/pwa-update-prompt'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">`n      <OfflineBanner />
      <Sidebar />
      <div className="relative min-h-screen lg:ml-64">{children}</div>
      <NotificationCenter className="fixed right-5 top-5 z-30 hidden lg:block" />`n      <PwaUpdatePrompt />`n      <BottomNavigation />
    </div>
  )
}