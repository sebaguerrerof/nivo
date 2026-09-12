import { Link } from 'react-router-dom'

export function AuthLinks() {
  return (
    <p className="text-center text-sm text-[var(--foreground-muted)]">
      ¿Aún no tienes cuenta?{' '}
      <Link className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300" to="/register">
        Crea la tuya
      </Link>
    </p>
  )
}
