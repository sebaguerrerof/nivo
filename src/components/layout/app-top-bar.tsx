import { useLocation } from 'react-router-dom'
import { NotificationButton } from '@/features/notifications/components/notification-button'
import { useGamificationSummary } from '@/features/gamification/hooks/use-gamification'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { getCurrentSectionTitle } from '@/components/layout/navigation'
import { StreakIndicator } from '@/components/layout/streak-indicator'
import { UserMenu } from '@/components/layout/user-menu'
import { XpIndicator } from '@/components/layout/xp-indicator'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'

export function AppTopBar() {
  const location = useLocation()
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const gamification = useGamificationSummary(user?.id, getTodayInTimeZone(timezone))

  return <header className="sticky top-0 z-30 hidden h-[4.5rem] border-b border-[var(--chrome-border)] bg-[var(--topbar-background)] backdrop-blur-xl lg:block"><div className="mx-auto flex h-full max-w-[100rem] items-center justify-between px-8 xl:px-10"><p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">{getCurrentSectionTitle(location.pathname)}</p><div className="flex items-center gap-1"><StreakIndicator streak={gamification.data?.streak} /><XpIndicator summary={gamification.data} /><NotificationButton /><span aria-hidden="true" className="mx-1 h-6 w-px bg-[var(--chrome-border)]" /><UserMenu /></div></div></header>
}