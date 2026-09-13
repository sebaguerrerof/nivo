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
import { TodayPage } from '@/features/planning/pages/today-page'
import { ProfilePage } from '@/features/profile/profile-page'

const ProgressPage = lazy(() => import('@/features/progress/pages/progress-page').then((module) => ({ default: module.ProgressPage })))
const FinancePage = lazy(() => import('@/features/finances/pages/finance-page').then((module) => ({ default: module.FinancePage })))

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { status } = useAuth()

  if (status === 'loading') return <PageLoader />
  if (status === 'authenticated') return <Redirect to="/dashboard" />

  return children
}

function ProtectedRoutes() {
  const { status } = useAuth()

  if (status === 'loading') return <PageLoader />
  if (status === 'unauthenticated') return <Redirect to="/login" />

  return (
    <AppShell>
      <Switch>
        <Route component={DashboardPage} exact path="/dashboard" />
        <Route component={TodayPage} exact path="/today" />
        <Route component={ProfilePage} exact path="/profile" />
        <Route exact path="/progress"><Suspense fallback={<PageLoader />}><ProgressPage /></Suspense></Route>
        <Route exact path="/finances"><Suspense fallback={<PageLoader />}><FinancePage /></Suspense></Route>
        <Redirect to="/dashboard" />
      </Switch>
    </AppShell>
  )
}

export function AppRoutes() {
  return (
    <Switch>
      <Route component={AuthCallbackPage} exact path="/auth/callback" />
      <Route component={ResetPasswordPage} exact path="/auth/reset-password" />
      <Route exact path="/login"><PublicOnlyRoute><LoginPage /></PublicOnlyRoute></Route>
      <Route exact path="/register"><PublicOnlyRoute><RegisterPage /></PublicOnlyRoute></Route>
      <Route exact path="/recover-password"><PublicOnlyRoute><RecoverPasswordPage /></PublicOnlyRoute></Route>
      <Route path="/"><ProtectedRoutes /></Route>
    </Switch>
  )
}