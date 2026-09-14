export function getUserInitials(firstName?: string | null, lastName?: string | null, fallback = 'N') {
  const initials = `${firstName?.trim().slice(0, 1) ?? ''}${lastName?.trim().slice(0, 1) ?? ''}`.toLocaleUpperCase('es-CL')
  return initials || fallback.slice(0, 2).toLocaleUpperCase('es-CL')
}