import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { PageLoader } from '@/components/feedback/page-loader'
import { useAuth } from '@/features/auth/auth-context'
import { AuthCallbackPage } from '@/features/auth/pages/auth-callback-page'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RecoverPasswordPage } from '@/features/auth/pages/recover-password-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { OnboardingPage } from '@/features/onboarding/onboarding-page'
import { TodayPage } from '@/features/planning/pages/today-page'
import { ProfilePage } from '@/features/profile/profile-page'
import { NotFoundPage } from '@/features/shared/not-found-page'
import { useProfile } from '@/hooks/use-profile'

const ProgressPage = lazy(() => import('@/features/progress/pages/progress-page').then((module) => ({ default: module.ProgressPage })))
const FinancePage = lazy(() => import('@/features/finances/pages/finance-page').then((module) => ({ default: module.FinancePage })))
const PaymentsPage = lazy(() => import('@/features/payments/pages/payments-page').then((module) => ({ default: module.PaymentsPage })))

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { status } = useAuth()
  if (status === 'loading') return <PageLoader />
  if (status === 'authenticated') return <Redirect to="/dashboard" />
  return children
}

function ProtectedRoutes() {
  const { status, user } = useAuth()
  const profile = useProfile(user?.id)
  if (status === 'loading' || profile.isLoading) return <PageLoader />
  if (status === 'unauthenticated') return <Redirect to="/login" />
  if (!profile.data?.onboarding_completed_at) return <Redirect to="/onboarding" />

  return <AppShell><Switch>
    <Route component={DashboardPage} exact path="/dashboard" />
    <Route component={TodayPage} exact path="/today" />
    <Route component={ProfilePage} exact path="/profile" />
    <Route exact path="/progress"><Suspense fallback={<PageLoader />}><ProgressPage /></Suspense></Route>
    <Route exact path="/finances"><Suspense fallback={<PageLoader />}><FinancePage /></Suspense></Route>
    <Route exact path="/payments"><Suspense fallback={<PageLoader />}><PaymentsPage /></Suspense></Route>
    <Route component={NotFoundPage} exact path="/not-found" />
    <Redirect to="/not-found" />
  </Switch></AppShell>
}

function OnboardingRoute() {
  const { status } = useAuth()
  if (status === 'loading') return <PageLoader />
  if (status === 'unauthenticated') return <Redirect to="/login" />
  return <OnboardingPage />
}

export function AppRoutes() {
  return <Switch>
    <Route component={AuthCallbackPage} exact path="/auth/callback" />
    <Route component={ResetPasswordPage} exact path="/auth/reset-password" />
    <Route exact path="/login"><PublicOnlyRoute><LoginPage /></PublicOnlyRoute></Route>
    <Route exact path="/register"><PublicOnlyRoute><RegisterPage /></PublicOnlyRoute></Route>
    <Route exact path="/recover-password"><PublicOnlyRoute><RecoverPasswordPage /></PublicOnlyRoute></Route>
    <Route component={OnboardingRoute} exact path="/onboarding" />
    <Route path="/"><ProtectedRoutes /></Route>
  </Switch>
}