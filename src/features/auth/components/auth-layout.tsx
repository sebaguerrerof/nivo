import { IonContent, IonPage } from '@ionic/react'
import type { ReactNode } from 'react'
import { NivoLogo } from '@/components/brand/nivo-logo'

interface AuthLayoutProps {
  children: ReactNode
  eyebrow: string
  title: string
  description: string
}

export function AuthLayout({ children, eyebrow, title, description }: AuthLayoutProps) {
  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="min-h-full bg-[var(--background)] lg:p-4">
          <div className="min-h-full overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(470px,0.82fr)] lg:rounded-[2rem] lg:border lg:border-[var(--border)] lg:bg-[var(--surface)]">
            <aside className="relative hidden overflow-hidden bg-[#123c36] px-12 py-11 text-white lg:flex lg:min-h-[calc(100vh-2rem)] lg:flex-col">
              <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:linear-gradient(115deg,transparent_0%,transparent_48%,rgba(255,255,255,0.12)_48.2%,transparent_48.7%)]" />
              <div aria-hidden="true" className="absolute -left-28 top-1/3 size-96 rounded-full bg-teal-400/15 blur-3xl" />
              <div aria-hidden="true" className="absolute bottom-0 right-0 size-72 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative animate-rise-in"><NivoLogo inverted /></div>
              <div className="relative my-auto max-w-lg animate-rise-in [animation-delay:80ms]">
                <p className="mb-6 text-xs font-semibold tracking-[0.18em] text-teal-100/70">UN ESPACIO PERSONAL</p>
                <h2 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em]">Tu día, con intención.</h2>
                <p className="mt-6 max-w-md text-base leading-7 text-teal-50/75">Una vista serena para decidir qué importa y avanzar sin ruido.</p>
                <div className="mt-10 max-w-sm border-l border-teal-200/35 pl-4 text-sm leading-6 text-teal-50/75">Menos pendientes en la cabeza. Más claridad en el día.</div>
              </div>
              <div className="relative animate-rise-in [animation-delay:140ms] text-xs font-medium tracking-[0.08em] text-teal-100/55">PRIVADO · A TU RITMO</div>
            </aside>

            <section className="flex min-h-full items-center justify-center px-5 py-8 sm:px-10 lg:min-h-[calc(100vh-2rem)] lg:px-14">
              <div className="w-full max-w-[27rem]">
                <div className="animate-rise-in"><NivoLogo className="mb-12 lg:hidden" /><p className="text-[11px] font-bold tracking-[0.16em] text-teal-700 dark:text-teal-400">{eyebrow}</p><h1 className="mt-3 text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.5rem]">{title}</h1><p className="mt-3 max-w-sm text-[15px] leading-6 text-[var(--foreground-muted)]">{description}</p></div>
                <div className="mt-8 animate-rise-in rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] [animation-delay:80ms] sm:p-7">{children}</div>
              </div>
            </section>
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}