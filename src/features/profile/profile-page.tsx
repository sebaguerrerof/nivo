import { zodResolver } from '@hookform/resolvers/zod'
import { IonContent, IonPage } from '@ionic/react'
import { Download, KeyRound, LogOut, RefreshCcw, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useHistory } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/auth-context'
import { ThemeSelector } from '@/features/profile/components/theme-selector'
import { type ProfileFormValues, profileSchema } from '@/features/profile/profile.schemas'
import { useProfile, useUpdateProfile } from '@/hooks/use-profile'
import { deleteOwnAccount } from '@/services/account.service'
import { authService } from '@/services/auth.service'
import { downloadOwnData } from '@/services/data-export.service'
import type { NotificationPreferences } from '@/types/profile'

const timezones = ['America/Santiago', 'America/Argentina/Buenos_Aires', 'America/Lima', 'America/Bogota', 'Europe/Madrid']
const preferenceLabels: Array<{ key: keyof NotificationPreferences; label: string; description: string }> = [
  { key: 'activities', label: 'Recordatorios de actividades', description: 'Planificación pendiente y actividades próximas.' },
  { key: 'payments', label: 'Pagos', description: 'Pagos próximos o vencidos.' },
  { key: 'finances', label: 'Finanzas', description: 'Presupuesto cercano a su límite.' },
  { key: 'achievements', label: 'Logros', description: 'Nuevos logros desbloqueados.' },
]

export function ProfilePage() {
  const history = useHistory()
  const { user, signOut } = useAuth()
  const { data: profile, isLoading, isError } = useProfile(user?.id)
  const updateProfile = useUpdateProfile(user?.id ?? '')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences>({ activities: true, payments: true, finances: true, achievements: true })
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { firstName: '', lastName: '', currency: 'CLP', timezone: 'America/Santiago', avatarUrl: '' } })

  useEffect(() => {
    if (!profile) return
    form.reset({ firstName: profile.first_name, lastName: profile.last_name ?? '', currency: profile.currency, timezone: profile.timezone, avatarUrl: profile.avatar_url ?? '' })
    setPreferences(profile.notification_preferences)
  }, [form, profile])

  const onSubmit = form.handleSubmit(async ({ firstName, lastName, currency, timezone, avatarUrl }) => {
    setFormError(null); setStatusMessage(null)
    try {
      await updateProfile.mutateAsync({ first_name: firstName, last_name: lastName?.trim() || null, avatar_url: avatarUrl?.trim() || null, currency, timezone, notification_preferences: preferences })
      setStatusMessage('Tus preferencias se guardaron correctamente.')
    } catch { setFormError('No pudimos guardar tus preferencias. Intenta nuevamente.') }
  })

  const onSignOut = async () => { setLogoutError(null); try { await signOut() } catch { setLogoutError('No pudimos cerrar tu sesión. Intenta nuevamente.') } }
  const exportData = async () => { if (!user) return; setFormError(null); setExporting(true); try { await downloadOwnData(user.id); setStatusMessage('Tu archivo JSON se descargó correctamente.') } catch { setFormError('No pudimos preparar tu archivo de datos. Intenta nuevamente.') } finally { setExporting(false) } }
  const changePassword = async () => { setPasswordMessage(null); if (password.length < 8) return setPasswordMessage('Usa al menos 8 caracteres.'); if (password !== passwordConfirmation) return setPasswordMessage('Las contraseñas no coinciden.'); try { await authService.updatePassword(password); setPassword(''); setPasswordConfirmation(''); setPasswordMessage('Tu contraseña se actualizó correctamente.') } catch { setPasswordMessage('No pudimos actualizar tu contraseña. Intenta nuevamente.') } }
  const deleteAccount = async () => { if (deleteConfirmation !== 'ELIMINAR') return; setDeleting(true); setFormError(null); try { await deleteOwnAccount(); await signOut(); history.replace('/login') } catch { setFormError('No pudimos eliminar tu cuenta. Intenta nuevamente.') } finally { setDeleting(false) } }

  return <IonPage><IonContent fullscreen><main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10"><div className="mx-auto max-w-2xl"><header className="mb-8"><p className="text-sm font-medium text-[var(--foreground-muted)]">Tu espacio</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Configuración</h1><p className="mt-2 text-[15px] text-[var(--foreground-muted)]">Ajusta lo básico para que Nivo se sienta tuyo.</p></header>{formError ? <div className="mb-5"><Alert variant="error">{formError}</Alert></div> : null}<Card className="p-5 sm:p-7"><div className="mb-6 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><UserRound aria-hidden="true" className="size-5" /></div><div><h2 className="font-bold text-[var(--foreground)]">Perfil y preferencias</h2><p className="text-sm text-[var(--foreground-muted)]">Tu información personal y cómo quieres usar Nivo.</p></div></div>{isError ? <Alert variant="error">No pudimos cargar tu perfil. Actualiza la página e inténtalo nuevamente.</Alert> : null}<form className="grid gap-5" noValidate onSubmit={onSubmit}>{statusMessage ? <Alert variant="success">{statusMessage}</Alert> : null}<div className="grid gap-5 sm:grid-cols-2"><Input autoComplete="given-name" disabled={isLoading} error={form.formState.errors.firstName?.message} label="Nombre" {...form.register('firstName')} /><Input autoComplete="family-name" disabled={isLoading} error={form.formState.errors.lastName?.message} label="Apellido (opcional)" {...form.register('lastName')} /></div><Input autoComplete="url" disabled={isLoading} error={form.formState.errors.avatarUrl?.message} label="Avatar (URL opcional)" placeholder="https://…" type="url" {...form.register('avatarUrl')} /><div className="grid gap-5 sm:grid-cols-2"><Select disabled={isLoading} error={form.formState.errors.currency?.message} label="Moneda" {...form.register('currency')}><option value="CLP">Peso chileno (CLP)</option><option value="USD">Dólar estadounidense (USD)</option><option value="EUR">Euro (EUR)</option></Select><Select disabled={isLoading} error={form.formState.errors.timezone?.message} label="Zona horaria" {...form.register('timezone')}>{timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}</Select></div><ThemeSelector /><section className="border-t border-[var(--border)] pt-5"><h3 className="font-semibold text-[var(--foreground)]">Notificaciones dentro de Nivo</h3><p className="mt-1 text-sm text-[var(--foreground-muted)]">No enviamos notificaciones push ni correos desde estas preferencias.</p><div className="mt-4 grid gap-3">{preferenceLabels.map(({ key, label, description }) => <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl bg-[var(--surface-muted)] px-3" key={key}><span><span className="block text-sm font-medium text-[var(--foreground)]">{label}</span><span className="block text-xs text-[var(--foreground-muted)]">{description}</span></span><input checked={preferences[key]} className="size-5 accent-teal-700" onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" /></label>)}</div></section><Button className="w-full sm:w-auto" loading={updateProfile.isPending} type="submit">Guardar preferencias</Button></form></Card><Card className="mt-5 p-5 sm:p-7"><h2 className="font-bold text-[var(--foreground)]">Cuenta y privacidad</h2><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Tus datos son privados. Nivo no envía finanzas ni pagos a la IA automáticamente, y nunca publica mensajes de WhatsApp por ti.</p><div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => void exportData()} loading={exporting} type="button" variant="secondary"><Download aria-hidden="true" className="size-4" />Exportar mis datos</Button><Link className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40" to="/onboarding"><RefreshCcw aria-hidden="true" className="size-4" />Revisar introducción</Link></div></Card><Card className="mt-5 p-5 sm:p-7"><h2 className="font-bold text-[var(--foreground)]">Contraseña</h2><p className="mt-1 text-sm text-[var(--foreground-muted)]">Actualízala cuando necesites proteger una sesión compartida.</p>{passwordMessage ? <div className="mt-4"><Alert variant={passwordMessage.includes('correctamente') ? 'success' : 'error'}>{passwordMessage}</Alert></div> : null}<div className="mt-5 grid gap-4 sm:grid-cols-2"><Input label="Nueva contraseña" minLength={8} onChange={(event) => setPassword(event.target.value)} type="password" value={password} /><Input label="Repite la contraseña" minLength={8} onChange={(event) => setPasswordConfirmation(event.target.value)} type="password" value={passwordConfirmation} /></div><Button className="mt-4" onClick={() => void changePassword()} type="button" variant="secondary"><KeyRound aria-hidden="true" className="size-4" />Cambiar contraseña</Button></Card><Card className="mt-5 p-5 sm:p-7"><h2 className="font-bold text-[var(--foreground)]">Sesión</h2><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Cierra tu sesión cuando termines de usar un dispositivo compartido.</p>{logoutError ? <div className="mt-4"><Alert variant="error">{logoutError}</Alert></div> : null}<Button className="mt-5" onClick={() => void onSignOut()} variant="danger"><LogOut aria-hidden="true" className="size-4" />Cerrar sesión</Button></Card><Card className="mt-5 border-rose-200/80 p-5 dark:border-rose-900/50 sm:p-7"><div className="flex gap-3"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-300" /><div><h2 className="font-bold text-[var(--foreground)]">Eliminar cuenta</h2><p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">Esta acción elimina permanentemente tus datos privados y no se puede deshacer. Escribe <strong>ELIMINAR</strong> para habilitarla.</p></div></div><Input className="mt-5" label="Confirmación" onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="ELIMINAR" value={deleteConfirmation} /><Button className="mt-4" disabled={deleteConfirmation !== 'ELIMINAR'} loading={deleting} onClick={() => void deleteAccount()} type="button" variant="danger"><Trash2 aria-hidden="true" className="size-4" />Eliminar mi cuenta</Button></Card></div></main></IonContent></IonPage>
}