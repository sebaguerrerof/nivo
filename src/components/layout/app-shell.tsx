import type { ReactNode } from 'react'
import { AppTopBar } from '@/components/layout/app-top-bar'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Sidebar } from '@/components/layout/sidebar'
import { OfflineBanner } from '@/components/feedback/offline-banner'
import { PwaUpdatePrompt } from '@/components/feedback/pwa-update-prompt'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <OfflineBanner />
      <Sidebar />
      <div className="min-h-screen lg:ml-56">
        <AppTopBar />
        <MobileHeader />
        <div className="relative min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4.5rem)]">{children}</div>
      </div>
      <PwaUpdatePrompt />
      <BottomNavigation />
    </div>
  )
}