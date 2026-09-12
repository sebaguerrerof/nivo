import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type EmailOnlyFormValues, type LoginFormValues, emailOnlySchema, loginSchema } from '@/features/auth/auth.schemas'
import { AuthLinks } from '@/features/auth/components/auth-links'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authService, getAuthErrorMessage } from '@/services/auth.service'

export function LoginPage() {
  const history = useHistory()
  const [formError, setFormError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const magicForm = useForm<EmailOnlyFormValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
  })

  const onSubmit = loginForm.handleSubmit(async (values) => {
    setFormError(null)
    try {
      await authService.signIn(values)
      history.replace('/dashboard')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  const onMagicLink = magicForm.handleSubmit(async ({ email }) => {
    setFormError(null)
    setMagicLinkSent(false)
    try {
      await authService.sendMagicLink(email)
      setMagicLinkSent(true)
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  return (
    <AuthLayout eyebrow="BIENVENIDO DE VUELTA" title="Entra a tu espacio." description="Continúa donde lo dejaste, a tu propio ritmo.">
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {formError ? <Alert variant="error">{formError}</Alert> : null}
        <Input
          autoComplete="email"
          error={loginForm.formState.errors.email?.message}
          label="Correo electrónico"
          placeholder="nombre@correo.com"
          type="email"
          {...loginForm.register('email')}
        />
        <Input
          autoComplete="current-password"
          error={loginForm.formState.errors.password?.message}
          label="Contraseña"
          type="password"
          {...loginForm.register('password')}
        />
        <div className="flex justify-end">
          <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400" to="/recover-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button className="mt-1 w-full" loading={loginForm.formState.isSubmitting} type="submit">
          Iniciar sesión
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3 text-xs text-[var(--foreground-subtle)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        o entra sin contraseña
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form noValidate onSubmit={onMagicLink}>
        {magicLinkSent ? <Alert variant="success">Revisa tu correo para continuar con el enlace seguro.</Alert> : null}
        <div className="mt-3 flex gap-2">
          <Input
            aria-label="Correo para magic link"
            autoComplete="email"
            className="min-w-0"
            error={magicForm.formState.errors.email?.message}
            label=""
            placeholder="nombre@correo.com"
            type="email"
            {...magicForm.register('email')}
          />
          <Button loading={magicForm.formState.isSubmitting} type="submit" variant="secondary">
            Enviar enlace
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <AuthLinks />
      </div>
    </AuthLayout>
  )
}
