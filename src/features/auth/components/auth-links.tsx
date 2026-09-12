import { Link } from 'react-router-dom'

export function AuthLinks() {
  return (
    <p className="text-center text-sm text-[var(--foreground-muted)]">
      ¿Primera vez en Nivo?{' '}
      <Link className="font-semibold text-teal-700 transition hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300" to="/register">
        Crea tu cuenta
      </Link>
    </p>
  )
}
