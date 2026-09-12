import { IonContent, IonPage } from '@ionic/react'
import { CalendarDays, ChevronRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/auth-context'
import { useProfile } from '@/hooks/use-profile'
import { getGreeting, getLongDate } from '@/features/dashboard/dashboard.utils'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useProfile(user?.id)
  const name = profile?.first_name || user?.user_metadata.first_name || 'ahí'

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-10 lg:pt-10">
          <div className="mx-auto max-w-5xl">
            <header className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--foreground-muted)]">{getGreeting()}</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl">
                  {isLoading ? <span className="inline-block h-9 w-32 animate-pulse rounded-lg bg-[var(--surface-muted)]" /> : name}
                </h1>
              </div>
              <Link
                aria-label="Abrir configuración de perfil"
                className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-teal-700 shadow-sm transition hover:bg-[var(--surface-muted)] dark:text-teal-400"
                to="/profile"
              >
                {name.slice(0, 1).toLocaleUpperCase('es-CL')}
              </Link>
            </header>

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground-muted)]">
              <CalendarDays aria-hidden="true" className="size-4 text-teal-700 dark:text-teal-400" />
              {getLongDate()}
            </div>

            <div className="animate-rise-in">
              <Card className="relative overflow-hidden p-6 sm:p-8">
                <div className="absolute -right-16 -top-16 size-52 rounded-full bg-teal-100/70 blur-3xl dark:bg-teal-900/25" />
                <div className="relative max-w-xl">
                  <div className="mb-6 grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                    <Sparkles aria-hidden="true" className="size-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Tu día está abierto.</h2>
                  <p className="mt-2 text-[15px] leading-6 text-[var(--foreground-muted)]">
                    Todavía no tienes un plan para hoy. Empieza por lo que realmente importa.
                  </p>
                  <button
                    className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm shadow-teal-900/15 opacity-70"
                    disabled
                    title="La planificación estará disponible en la Fase 2"
                    type="button"
                  >
                    Crear mi día
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                  <p className="mt-2 text-xs text-[var(--foreground-subtle)]">La planificación llegará en la Fase 2.</p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}
