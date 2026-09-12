import { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { authService, getAuthErrorMessage } from '@/services/auth.service'

export function AuthCallbackPage() {
  const history = useHistory()
  const location = useLocation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code')

    if (!code) {
      history.replace('/login')
      return
    }

    void authService
      .exchangeCodeForSession(code)
      .then(() => history.replace('/dashboard'))
      .catch((error: unknown) => setErrorMessage(getAuthErrorMessage(error)))
  }, [history, location.search])

  return (
    <AuthLayout eyebrow="VERIFICANDO ACCESO" title="Un momento." description="Estamos preparando tu sesión segura.">
      {errorMessage ? (
        <div className="grid gap-5">
          <Alert variant="error">{errorMessage}</Alert>
          <Button onClick={() => history.replace('/login')} variant="secondary">
            Volver a iniciar sesión
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
          <span className="size-4 animate-spin rounded-full border-2 border-teal-700 border-r-transparent" aria-label="Verificando" />
          Verificando enlace seguro…
        </div>
      )}
    </AuthLayout>
  )
}
