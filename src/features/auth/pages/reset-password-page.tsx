import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type ResetPasswordFormValues, resetPasswordSchema } from '@/features/auth/auth.schemas'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authService, getAuthErrorMessage } from '@/services/auth.service'

export function ResetPasswordPage() {
  const history = useHistory()
  const [canReset, setCanReset] = useState<boolean | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    const sessionRequest = code ? authService.exchangeCodeForSession(code) : authService.getSession()

    void sessionRequest
      .then((session) => setCanReset(Boolean(session)))
      .catch(() => setCanReset(false))
  }, [])

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFormError(null)
    try {
      await authService.updatePassword(password)
      history.replace('/dashboard')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  return (
    <AuthLayout eyebrow="NUEVA CONTRASEÑA" title="Protege tu espacio." description="Elige una contraseña nueva y segura para continuar.">
      {canReset === false ? (
        <div className="grid gap-5">
          <Alert variant="error">El enlace no es válido o ya expiró. Solicita uno nuevo para continuar.</Alert>
          <Link className="text-center text-sm font-semibold text-teal-700 dark:text-teal-400" to="/recover-password">
            Solicitar un nuevo enlace
          </Link>
        </div>
      ) : (
        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          <Input
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            type="password"
            {...form.register('password')}
          />
          <Input
            autoComplete="new-password"
            error={form.formState.errors.confirmPassword?.message}
            label="Repite la nueva contraseña"
            type="password"
            {...form.register('confirmPassword')}
          />
          <Button className="mt-1 min-h-12 w-full" loading={form.formState.isSubmitting || canReset === null} type="submit">
            Guardar nueva contraseña
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
