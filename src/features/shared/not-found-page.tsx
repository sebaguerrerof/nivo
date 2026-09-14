import { IonContent, IonPage } from '@ionic/react'
import { ArrowLeft, Map } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'

export function NotFoundPage() {
  return <IonPage><IonContent fullscreen><main className="grid min-h-full place-items-center px-5 pb-28 pt-7"><Card className="w-full max-w-md p-7 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"><Map aria-hidden="true" className="size-6" /></div><h1 className="mt-6 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Esta página no existe.</h1><p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">Puede que el enlace haya cambiado o ya no esté disponible.</p><Link className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800" to="/dashboard"><ArrowLeft aria-hidden="true" className="size-4" />Volver a Nivo</Link></Card></main></IonContent></IonPage>
}
