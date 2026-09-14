import { NivoLogo } from '@/components/brand/nivo-logo'
import { NotificationButton } from '@/features/notifications/components/notification-button'
import { useGamificationSummary } from '@/features/gamification/hooks/use-gamification'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { UserMenu } from '@/components/layout/user-menu'
import { XpIndicator } from '@/components/layout/xp-indicator'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'

export function MobileHeader() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const timezone = profile?.timezone || DEFAULT_TIMEZONE
  const gamification = useGamificationSummary(user?.id, getTodayInTimeZone(timezone))

  return <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--chrome-border)] bg-[var(--topbar-background)] px-4 backdrop-blur-xl lg:hidden"><NivoLogo className="gap-2" /><div className="flex items-center gap-0.5"><XpIndicator mobile summary={gamification.data} /><NotificationButton /><UserMenu mobile /></div></header>
}