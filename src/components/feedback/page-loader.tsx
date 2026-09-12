import { IonContent, IonPage } from '@ionic/react'
import { LoaderCircle } from 'lucide-react'
import { NivoLogo } from '@/components/brand/nivo-logo'

export function PageLoader() {
  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="grid min-h-full place-items-center bg-[var(--background)] px-6">
          <div className="grid justify-items-center gap-4 text-[var(--foreground-muted)]">
            <NivoLogo />
            <LoaderCircle aria-label="Cargando" className="size-5 animate-spin text-teal-700" />
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}
