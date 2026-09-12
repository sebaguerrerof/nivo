import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type EmailOnlyFormValues, emailOnlySchema } from '@/features/auth/auth.schemas'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { authService, getAuthErrorMessage } from '@/services/auth.service'

export function RecoverPasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<EmailOnlyFormValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(null)
    setMessage(null)
    try {
      await authService.sendPasswordReset(email)
      setMessage('Si existe una cuenta con ese correo, recibirás un enlace para crear una nueva contraseña.')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  return (
    <AuthLayout eyebrow="RECUPERA TU ACCESO" title="Volvamos a entrar." description="Te enviaremos un enlace seguro para crear una nueva contraseña.">
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        {message ? <Alert variant="success">{message}</Alert> : null}
        {formError ? <Alert variant="error">{formError}</Alert> : null}
        <Input
          autoComplete="email"
          error={form.formState.errors.email?.message}
          label="Correo electrónico"
          placeholder="nombre@correo.com"
          type="email"
          {...form.register('email')}
        />
        <Button className="mt-1 w-full" loading={form.formState.isSubmitting} type="submit">
          Enviar enlace
        </Button>
      </form>
      <Link className="mt-7 block text-center text-sm font-semibold text-teal-700 dark:text-teal-400" to="/login">
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
