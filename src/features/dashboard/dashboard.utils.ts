import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function getGreeting(now = new Date()) {
  const hour = now.getHours()

  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function getLongDate(now = new Date()) {
  const value = format(now, "EEEE d 'de' MMMM", { locale: es })
  return value.charAt(0).toLocaleUpperCase('es-CL') + value.slice(1)
}
