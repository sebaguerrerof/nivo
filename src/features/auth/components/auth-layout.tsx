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
        <main className="min-h-full bg-[var(--background)] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,0.75fr)]">
          <aside className="relative hidden overflow-hidden bg-teal-800 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -left-28 top-20 size-96 rounded-full bg-teal-600/35 blur-3xl" />
            <div className="absolute -bottom-24 right-0 size-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <NivoLogo className="relative" />
            <div className="relative max-w-md">
              <p className="mb-5 text-sm font-medium tracking-[0.18em] text-teal-200">UN ESPACIO PARA TI</p>
              <h2 className="text-5xl font-semibold leading-[1.08] tracking-[-0.045em]">Un día claro empieza con una pausa.</h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-teal-100/85">
                Nivo te acompaña a ordenar lo esencial sin convertir tu vida en otra lista interminable.
              </p>
            </div>
            <p className="relative text-sm text-teal-100/65">Diseñado para tu ritmo, en privado.</p>
          </aside>

          <section className="flex min-h-full items-center justify-center px-5 py-9 sm:px-8 lg:px-12">
            <div className="w-full max-w-md">
              <NivoLogo className="mb-12 lg:hidden" />
              <p className="text-xs font-bold tracking-[0.14em] text-teal-700 dark:text-teal-400">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">{title}</h1>
              <p className="mt-3 text-[15px] leading-6 text-[var(--foreground-muted)]">{description}</p>
              <div className="mt-8">{children}</div>
            </div>
          </section>
        </main>
      </IonContent>
    </IonPage>
  )
}
