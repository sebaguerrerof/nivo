import { Component, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { NivoLogo } from '@/components/brand/nivo-logo'
import { Button } from '@/components/ui/button'

interface AppErrorBoundaryProps { children: ReactNode }
interface AppErrorBoundaryState { hasError: boolean }

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState { return { hasError: true } }
  override componentDidCatch() { /* Nunca mostramos detalles técnicos ni datos personales en la UI. */ }

  override render() {
    if (!this.state.hasError) return this.props.children
    return <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6"><section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-[var(--shadow-card)]"><NivoLogo className="mx-auto justify-center" /><h1 className="mt-8 text-2xl font-bold tracking-[-0.035em] text-[var(--foreground)]">Algo no salió como esperábamos.</h1><p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">Tu información no se modificó. Recarga Nivo para intentarlo nuevamente.</p><Button className="mt-7" onClick={() => window.location.reload()}><RotateCcw aria-hidden="true" className="size-4" />Recargar Nivo</Button></section></main>
  }
}
