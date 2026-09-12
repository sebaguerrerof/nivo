import { NavLink } from 'react-router-dom'
import { mobileNavigation } from '@/components/layout/navigation'
import { cn } from '@/lib/utils'

export function BottomNavigation() {
  return (
    <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color:var(--surface)/0.94] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {mobileNavigation.map(({ label, href, icon: Icon, available }) => {
          const isPrimaryAction = label === 'Crear'

          if (available && href) {
            return (
              <NavLink
                activeClassName="text-teal-700 dark:text-teal-300"
                className="flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium text-[var(--foreground-subtle)]"
                key={label}
                to={href}
              >
                <Icon aria-hidden="true" className="size-[19px]" />
                {label}
              </NavLink>
            )
          }

          return (
            <span
              aria-disabled="true"
              className={cn(
                'flex min-h-12 cursor-not-allowed flex-col items-center justify-center gap-1 text-[10px] font-medium text-[var(--foreground-subtle)]',
                isPrimaryAction && '-mt-6',
              )}
              key={label}
              title="Disponible en una próxima fase"
            >
              <span
                className={cn(
                  'grid place-items-center',
                  isPrimaryAction
                    ? 'size-12 rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/20'
                    : 'text-[var(--foreground-subtle)]',
                )}
              >
                <Icon aria-hidden="true" className={isPrimaryAction ? 'size-5' : 'size-[19px]'} />
              </span>
              {label}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
