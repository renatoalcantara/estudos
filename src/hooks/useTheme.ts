import { useSettings } from '../context/SettingsContext'
import type { ThemeChoice } from '../lib/theme/tokens'

export interface ThemeController {
  theme: ThemeChoice
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: ThemeChoice) => void
}

/** Atalho para a parte de tema das preferências. */
export function useTheme(): ThemeController {
  const { theme, resolvedTheme, setTheme } = useSettings()
  return { theme, resolvedTheme, setTheme }
}
