import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function getGreeting(now = new Date(), timezone?: string) {
  const hour = timezone
    ? Number(new Intl.DateTimeFormat('en-US', { hour: '2-digit', hourCycle: 'h23', timeZone: timezone }).format(now))
    : now.getHours()

  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function getLongDate(now = new Date(), timezone?: string) {
  const value = timezone
    ? new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone }).format(now)
    : format(now, "EEEE d 'de' MMMM", { locale: es })
  return value.charAt(0).toLocaleUpperCase('es-CL') + value.slice(1)
}