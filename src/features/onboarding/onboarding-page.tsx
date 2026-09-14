import { IonContent, IonPage } from '@ionic/react'
import { Check, ChevronLeft, ChevronRight, Compass, Sparkles, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/auth-context'
import { onboardingBasicsSchema } from '@/features/profile/profile.schemas'
import { DEFAULT_TIMEZONE } from '@/features/planning/planning.constants'
import { getTodayInTimeZone } from '@/features/planning/planning.utils'
import { useProfile, useUpdateProfile } from '@/hooks/use-profile'
import { cn } from '@/lib/utils'
import { onboardingInterestOptions, type Currency, type OnboardingInterest, type ProfileUpdate } from '@/types/profile'

const interestLabels: Record<OnboardingInterest, string> = {
  routine: 'Rutina',
  work: 'Trabajo',
  sport: 'Deporte',
  reading: 'Lectura',
  finances: 'Finanzas',
  therapy: 'Terapia',
  habits: 'Hábitos',
  other: 'Otro',
}

const timezones = ['America/Santiago', 'America/Argentina/Buenos_Aires', 'America/Lima', 'America/Bogota', 'Europe/Madrid']

export function OnboardingPage() {
  const history = useHistory()
  const { user } = useAuth()
  const profileQuery = useProfile(user?.id)
  const updateProfile = useUpdateProfile(user?.id ?? '')
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currency, setCurrency] = useState<Currency>('CLP')
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE)
  const [interests, setInterests] = useState<OnboardingInterest[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const profile = profileQuery.data
    if (!profile) return
    setFirstName(profile.first_name)
    setLastName(profile.last_name ?? '')
    setCurrency(profile.currency)
    setTimezone(profile.timezone)
    setInterests(profile.onboarding_interests)
  }, [profileQuery.data])

  const save = async (changes: Partial<ProfileUpdate>) => {
    const profile = profileQuery.data
    if (!profile) return
    await updateProfile.mutateAsync({
      first_name: profile.first_name,
      last_name: profile.last_name,
      currency: profile.currency,
      timezone: profile.timezone,
      avatar_url: profile.avatar_url,
      onboarding_interests: profile.onboarding_interests,
      notification_preferences: profile.notification_preferences,
      ...changes,
    })
  }

  const saveBasics = async () => {
    const parsed = onboardingBasicsSchema.safeParse({ firstName, lastName, currency, timezone })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa tus datos antes de continuar.')
      return
    }
    setError(null)
    try {
      await save({ first_name: parsed.data.firstName, last_name: parsed.data.lastName?.trim() || null, currency: parsed.data.currency, timezone: parsed.data.timezone })
      setStep(2)
    } catch {
      setError('No pudimos guardar tus datos. Intenta nuevamente.')
    }
  }

  const saveInterests = async () => {
    setError(null)
    try {
      await save({ onboarding_interests: interests })
      setStep(3)
    } catch {
      setError('No pudimos guardar tus intereses. Intenta nuevamente.')
    }
  }

  const finish = async (destination: string) => {
    setError(null)
    try {
      await save({ onboarding_completed_at: new Date().toISOString(), onboarding_interests: interests })
      history.replace(destination)
    } catch {
      setError('No pudimos terminar la introducción. Intenta nuevamente.')
    }
  }

  const toggleInterest = (interest: OnboardingInterest) => setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest])

  if (profileQuery.isLoading) return <IonPage><IonContent fullscreen><main className="grid min-h-full place-items-center p-6 text-sm text-[var(--foreground-muted)]">Preparando tu espacio…</main></IonContent></IonPage>
  if (!profileQuery.data) return <IonPage><IonContent fullscreen><main className="grid min-h-full place-items-center p-6"><Alert variant="error">No pudimos cargar tu perfil. Actualiza la página e inténtalo nuevamente.</Alert></main></IonContent></IonPage>

  return <IonPage><IonContent fullscreen><main className="flex min-h-full items-center px-5 py-8 sm:px-8"><div className="mx-auto w-full max-w-xl"><div className="mb-7 flex items-center justify-between gap-4"><p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Nivo</p><p className="text-xs font-medium text-[var(--foreground-subtle)]">{step === 0 ? 'Bienvenida' : `Paso ${step} de 4`}</p></div>{step > 0 ? <div aria-label={`Paso ${step} de 4`} aria-valuemax={4} aria-valuemin={1} aria-valuenow={step} className="mb-7 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]" role="progressbar"><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${step * 25}%` }} /></div> : null}<Card className="overflow-hidden p-6 sm:p-8">{error ? <div className="mb-5"><Alert variant="error">{error}</Alert></div> : null}{step === 0 ? <section className="animate-rise-in"><div className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Sparkles aria-hidden="true" className="size-6" /></div><h1 className="mt-7 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">Bienvenido a Nivo.</h1><p className="mt-3 max-w-md text-[16px] leading-7 text-[var(--foreground-muted)]">Organiza tus días, sigue tu progreso y mantén tus finanzas bajo control. Tardarás menos de dos minutos.</p><Button className="mt-8 w-full sm:w-auto" onClick={() => setStep(1)}>Comenzar<ChevronRight aria-hidden="true" className="size-4" /></Button></section> : null}{step === 1 ? <section className="grid gap-5 animate-rise-in"><div><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Compass aria-hidden="true" className="size-5" /></div><h1 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Lo básico para empezar.</h1><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Podrás modificarlo cuando quieras desde Configuración.</p></div><div className="grid gap-5 sm:grid-cols-2"><Input autoComplete="given-name" label="Nombre" onChange={(event) => setFirstName(event.target.value)} value={firstName} /><Input autoComplete="family-name" label="Apellido (opcional)" onChange={(event) => setLastName(event.target.value)} value={lastName} /></div><div className="grid gap-5 sm:grid-cols-2"><Select label="Moneda" onChange={(event) => setCurrency(event.target.value as Currency)} value={currency}><option value="CLP">Peso chileno (CLP)</option><option value="USD">Dólar estadounidense (USD)</option><option value="EUR">Euro (EUR)</option></Select><Select label="Zona horaria" onChange={(event) => setTimezone(event.target.value)} value={timezone}>{timezones.map((value) => <option key={value} value={value}>{value}</option>)}</Select></div><div className="flex gap-3"><Button loading={updateProfile.isPending} onClick={() => void saveBasics()}>Continuar<ChevronRight aria-hidden="true" className="size-4" /></Button><Button onClick={() => setStep(0)} variant="ghost"><ChevronLeft aria-hidden="true" className="size-4" />Volver</Button></div></section> : null}{step === 2 ? <section className="animate-rise-in"><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Compass aria-hidden="true" className="size-5" /></div><h1 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">¿Qué quieres organizar?</h1><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Elige lo que te importa ahora. Usaremos esto solo para personalizar tu inicio más adelante.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{onboardingInterestOptions.map((interest) => { const selected = interests.includes(interest); return <button aria-pressed={selected} className={cn('min-h-12 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600', selected ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]')} key={interest} onClick={() => toggleInterest(interest)} type="button">{selected ? <Check aria-hidden="true" className="mr-1 inline size-3.5" /> : null}{interestLabels[interest]}</button> })}</div><div className="mt-7 flex gap-3"><Button loading={updateProfile.isPending} onClick={() => void saveInterests()}>Continuar<ChevronRight aria-hidden="true" className="size-4" /></Button><Button onClick={() => setStep(1)} variant="ghost"><ChevronLeft aria-hidden="true" className="size-4" />Volver</Button></div></section> : null}{step === 3 ? <section className="animate-rise-in"><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Sparkles aria-hidden="true" className="size-5" /></div><h1 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">¿Quieres crear tu primer plan?</h1><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Puedes comenzar con algo simple hoy y completar el resto cuando lo necesites.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button loading={updateProfile.isPending} onClick={() => void finish(`/today?date=${getTodayInTimeZone(timezone)}`)}>Crear mi día<ChevronRight aria-hidden="true" className="size-4" /></Button><Button disabled={updateProfile.isPending} onClick={() => setStep(4)} variant="secondary">Ahora no</Button></div></section> : null}{step === 4 ? <section className="animate-rise-in"><div className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><WalletCards aria-hidden="true" className="size-5" /></div><h1 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">¿Quieres configurar tus finanzas?</h1><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Registra un presupuesto solo si hoy te sirve. Nivo también funciona sin esta parte.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button loading={updateProfile.isPending} onClick={() => void finish('/finances?action=budget')}>Crear presupuesto<ChevronRight aria-hidden="true" className="size-4" /></Button><Button disabled={updateProfile.isPending} onClick={() => void finish('/dashboard')} variant="secondary">Ahora no</Button></div></section> : null}</Card></div></main></IonContent></IonPage>
}
