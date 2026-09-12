import { IonApp, setupIonicReact } from '@ionic/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { IonReactRouter } from '@ionic/react-router'
import { AppRoutes } from '@/app/app-routes'
import { AuthProvider } from '@/features/auth/auth-context'
import { ThemeController } from '@/hooks/use-theme'
import { queryClient } from '@/lib/query-client'

setupIonicReact({ mode: 'md' })

export function App() {
  return (
    <IonApp>
      <QueryClientProvider client={queryClient}>
        <ThemeController />
        <IonReactRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </IonReactRouter>
      </QueryClientProvider>
    </IonApp>
  )
}
