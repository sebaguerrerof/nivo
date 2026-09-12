import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type RegisterFormValues, registerSchema } from '@/features/auth/auth.schemas'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authService, getAuthErrorMessage } from '@/services/auth.service'

export function RegisterPage() {
  const history = useHistory()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async ({ firstName, lastName, email, password }) => {
    setFormError(null)
    setConfirmationSent(false)
    try {
      const result = await authService.signUp({ firstName, lastName, email, password })

      if (result.needsEmailConfirmation) {
        setConfirmationSent(true)
        return
      }

      history.replace('/dashboard')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  return (
    <AuthLayout eyebrow="EMPIEZA CON CALMA" title="Crea tu espacio." description="Lo esencial para empezar hoy; el resto puede esperar.">
      {confirmationSent ? (
        <div className="grid gap-5">
          <Alert variant="success">Te enviamos un correo de confirmación. Ábrelo para activar tu cuenta.</Alert>
          <Link className="text-center text-sm font-semibold text-teal-700 dark:text-teal-400" to="/login">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input autoComplete="given-name" error={form.formState.errors.firstName?.message} label="Nombre" {...form.register('firstName')} />
            <Input autoComplete="family-name" error={form.formState.errors.lastName?.message} label="Apellido (opcional)" {...form.register('lastName')} />
          </div>
          <Input
            autoComplete="email"
            error={form.formState.errors.email?.message}
            label="Correo electrónico"
            placeholder="nombre@correo.com"
            type="email"
            {...form.register('email')}
          />
          <Input
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            type="password"
            {...form.register('password')}
          />
          <Input
            autoComplete="new-password"
            error={form.formState.errors.confirmPassword?.message}
            label="Repite tu contraseña"
            type="password"
            {...form.register('confirmPassword')}
          />
          <Button className="mt-1 min-h-12 w-full" loading={form.formState.isSubmitting} type="submit">
            Crear cuenta
          </Button>
          <p className="text-center text-xs leading-5 text-[var(--foreground-subtle)]">
            Al continuar, aceptas usar Nivo como un espacio personal y privado.
          </p>
        </form>
      )}
      <p className="mt-7 text-center text-sm text-[var(--foreground-muted)]">
        ¿Ya tienes una cuenta?{' '}
        <Link className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400" to="/login">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
