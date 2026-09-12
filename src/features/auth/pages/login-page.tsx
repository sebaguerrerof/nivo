import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type LoginFormValues, loginSchema } from '@/features/auth/auth.schemas'
import { AuthLinks } from '@/features/auth/components/auth-links'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authService, getAuthErrorMessage } from '@/services/auth.service'

export function LoginPage() {
  const history = useHistory()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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

  return (
    <AuthLayout eyebrow="BIENVENIDO DE VUELTA" title="Qué bueno verte." description="Inicia sesión para retomar tu día con claridad.">
      <form className="grid gap-5" noValidate onSubmit={onSubmit}>
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
          endAdornment={
            <button
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="grid size-9 place-items-center rounded-lg text-[var(--foreground-subtle)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            </button>
          }
          error={loginForm.formState.errors.password?.message}
          label="Contraseña"
          placeholder="Tu contraseña"
          type={showPassword ? 'text' : 'password'}
          {...loginForm.register('password')}
        />
        <div className="-mt-1 flex justify-end">
          <Link className="text-sm font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300" to="/recover-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button className="mt-1 min-h-12 w-full" loading={loginForm.formState.isSubmitting} type="submit">
          <LockKeyhole aria-hidden="true" className="size-4" />
          Entrar a Nivo
        </Button>
      </form>

      <div className="mt-7 border-t border-[var(--border)] pt-6">
        <div className="mb-6 flex items-center justify-center gap-2 text-xs text-[var(--foreground-subtle)]">
          <ShieldCheck aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-400" />
          Tu información se mantiene privada.
        </div>
        <AuthLinks />
      </div>
    </AuthLayout>
  )
}
