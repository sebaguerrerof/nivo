import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { authService, type AuthUser } from '@/services/auth.service'
import { isSupabaseConfigured } from '@/lib/supabase/client'

const SESSION_INITIALIZATION_TIMEOUT_MS = 8_000

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  session: Session | null
  status: AuthStatus
  user: AuthUser | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('unauthenticated')
      return undefined
    }

    let active = true
    const setCurrentSession = (nextSession: Session | null) => {
      if (!active) return
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'unauthenticated')
    }
    const initializationTimer = window.setTimeout(() => setCurrentSession(null), SESSION_INITIALIZATION_TIMEOUT_MS)
    const resolveInitialSession = (nextSession: Session | null) => {
      window.clearTimeout(initializationTimer)
      setCurrentSession(nextSession)
    }

    void authService
      .getSession()
      .then(resolveInitialSession)
      .catch(() => resolveInitialSession(null))

    const { data } = authService.onAuthStateChange((_event, nextSession) => setCurrentSession(nextSession))

    return () => {
      active = false
      window.clearTimeout(initializationTimer)
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status,
      user: session?.user ?? null,
      signOut: async () => {
        await authService.signOut()
      },
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// This hook intentionally lives beside its provider so the context contract is
// kept private to the feature. It does not affect the component refresh path.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  }

  return context
}
