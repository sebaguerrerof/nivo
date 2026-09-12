import { zodResolver } from '@hookform/resolvers/zod'
import { IonContent, IonPage } from '@ionic/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LogOut, UserRound } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/auth-context'
import { ThemeSelector } from '@/features/profile/components/theme-selector'
import { type ProfileFormValues, profileSchema } from '@/features/profile/profile.schemas'
import { useProfile, useUpdateProfile } from '@/hooks/use-profile'

const timezones = ['America/Santiago', 'America/Argentina/Buenos_Aires', 'America/Lima', 'America/Bogota', 'Europe/Madrid']

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const { data: profile, isLoading, isError } = useProfile(user?.id)
  const updateProfile = useUpdateProfile(user?.id ?? '')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', currency: 'CLP', timezone: 'America/Santiago' },
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      firstName: profile.first_name,
      lastName: profile.last_name ?? '',
      currency: profile.currency,
      timezone: profile.timezone,
    })
  }, [form, profile])

  const onSubmit = form.handleSubmit(async ({ firstName, lastName, currency, timezone }) => {
    setFormError(null)
    setStatusMessage(null)
    try {
      await updateProfile.mutateAsync({
        first_name: firstName,
        last_name: lastName?.trim() || null,
        currency,
        timezone,
      })
      setStatusMessage('Tus preferencias se guardaron correctamente.')
    } catch {
      setFormError('No pudimos guardar tus preferencias. Intenta nuevamente.')
    }
  })

  const onSignOut = async () => {
    setLogoutError(null)
    try {
      await signOut()
    } catch {
      setLogoutError('No pudimos cerrar tu sesión. Intenta nuevamente.')
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="mx-auto max-w-2xl">
            <header className="mb-8">
              <p className="text-sm font-medium text-[var(--foreground-muted)]">Tu espacio</p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Configuración</h1>
              <p className="mt-2 text-[15px] text-[var(--foreground-muted)]">Ajusta lo básico para que Nivo se sienta tuyo.</p>
            </header>

            <Card className="p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                  <UserRound aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[var(--foreground)]">Perfil</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">Tu información personal y preferencias.</p>
                </div>
              </div>

              {isError ? <Alert variant="error">No pudimos cargar tu perfil. Actualiza la página e inténtalo nuevamente.</Alert> : null}
              <form className="grid gap-5" noValidate onSubmit={onSubmit}>
                {formError ? <Alert variant="error">{formError}</Alert> : null}
                {statusMessage ? <Alert variant="success">{statusMessage}</Alert> : null}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    autoComplete="given-name"
                    disabled={isLoading}
                    error={form.formState.errors.firstName?.message}
                    label="Nombre"
                    {...form.register('firstName')}
                  />
                  <Input
                    autoComplete="family-name"
                    disabled={isLoading}
                    error={form.formState.errors.lastName?.message}
                    label="Apellido (opcional)"
                    {...form.register('lastName')}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select disabled={isLoading} error={form.formState.errors.currency?.message} label="Moneda" {...form.register('currency')}>
                    <option value="CLP">Peso chileno (CLP)</option>
                    <option value="USD">Dólar estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </Select>
                  <Select disabled={isLoading} error={form.formState.errors.timezone?.message} label="Zona horaria" {...form.register('timezone')}>
                    {timezones.map((timezone) => (
                      <option key={timezone} value={timezone}>
                        {timezone}
                      </option>
                    ))}
                  </Select>
                </div>
                <ThemeSelector />
                <Button className="w-full sm:w-auto" loading={updateProfile.isPending} type="submit">
                  Guardar preferencias
                </Button>
              </form>
            </Card>

            <Card className="mt-5 border-rose-200/80 p-5 dark:border-rose-900/50 sm:p-7">
              <h2 className="font-bold text-[var(--foreground)]">Sesión</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Cierra tu sesión cuando termines de usar un dispositivo compartido.</p>
              {logoutError ? <div className="mt-4"><Alert variant="error">{logoutError}</Alert></div> : null}
              <Button className="mt-5" onClick={() => void onSignOut()} variant="danger">
                <LogOut aria-hidden="true" className="size-4" />
                Cerrar sesión
              </Button>
            </Card>
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}
