import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline) }
  }, [])
  if (online) return null
  return <div className="fixed inset-x-0 top-0 z-[70] flex min-h-11 items-center justify-center gap-2 bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white"><WifiOff aria-hidden="true" className="size-4 shrink-0" />Sin conexión. Puedes ver contenido cargado, pero los cambios se guardarán cuando vuelvas a conectarte.</div>
}