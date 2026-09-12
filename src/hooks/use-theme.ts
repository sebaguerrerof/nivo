import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme.store'

function isDarkTheme(preference: ReturnType<typeof useThemeStore.getState>['preference']) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  return preference === 'dark'
}

export function ThemeController() {
  const preference = useThemeStore((state) => state.preference)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', isDarkTheme(preference))
      document.documentElement.style.colorScheme = isDarkTheme(preference) ? 'dark' : 'light'
    }

    applyTheme()
    mediaQuery.addEventListener('change', applyTheme)

    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [preference])

  return null
}
