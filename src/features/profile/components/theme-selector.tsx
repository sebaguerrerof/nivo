import { Check, Moon, Monitor, Sun } from 'lucide-react'
import { useThemeStore, type ThemePreference } from '@/stores/theme.store'
import { cn } from '@/lib/utils'

const options: Array<{ label: string; value: ThemePreference; icon: typeof Sun }> = [
  { label: 'Claro', value: 'light', icon: Sun },
  { label: 'Oscuro', value: 'dark', icon: Moon },
  { label: 'Sistema', value: 'system', icon: Monitor },
]

export function ThemeSelector() {
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-[var(--foreground)]">Apariencia</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ label, value, icon: Icon }) => {
          const selected = preference === value
          return (
            <button
              aria-pressed={selected}
              className={cn(
                'relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium transition',
                selected
                  ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]',
              )}
              key={value}
              onClick={() => setPreference(value)}
              type="button"
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
              {selected ? <Check aria-hidden="true" className="absolute right-2 top-2 size-3.5" /> : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
