import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_INSTRUMENT_ID } from '../lib/instruments/instruments'
import type { InstrumentId } from '../lib/instruments/types'
import { A4 } from '../lib/music/noteUtils'
import type { ThemeChoice } from '../lib/theme/tokens'

const KEYS = {
  theme: 'afinador:theme',
  instrument: 'afinador:instrument',
  a4: 'afinador:a4',
} as const

interface SettingsValue {
  theme: ThemeChoice
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: ThemeChoice) => void

  instrumentId: InstrumentId
  setInstrumentId: (id: InstrumentId) => void

  a4: number
  setA4: (hz: number) => void
}

const SettingsContext = createContext<SettingsValue | null>(null)

function readStored<T extends string>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  return (localStorage.getItem(key) as T | null) ?? fallback
}

function prefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() =>
    readStored<ThemeChoice>(KEYS.theme, 'system'),
  )
  const [instrumentId, setInstrumentIdState] = useState<InstrumentId>(() =>
    readStored<InstrumentId>(KEYS.instrument, DEFAULT_INSTRUMENT_ID),
  )
  const [a4, setA4State] = useState<number>(() => {
    const stored = Number(readStored(KEYS.a4, String(A4)))
    return Number.isFinite(stored) && stored > 0 ? stored : A4
  })

  const [systemDark, setSystemDark] = useState<boolean>(() => prefersDark())

  // Acompanha a preferência do sistema quando o tema é "system".
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  // Aplica o tema ao <html> e à barra de status do PWA.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#0b0b0b' : '#ffffff')
  }, [resolvedTheme])

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t)
    localStorage.setItem(KEYS.theme, t)
  }, [])

  const setInstrumentId = useCallback((id: InstrumentId) => {
    setInstrumentIdState(id)
    localStorage.setItem(KEYS.instrument, id)
  }, [])

  const setA4 = useCallback((hz: number) => {
    setA4State(hz)
    localStorage.setItem(KEYS.a4, String(hz))
  }, [])

  const value = useMemo<SettingsValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      instrumentId,
      setInstrumentId,
      a4,
      setA4,
    }),
    [theme, resolvedTheme, setTheme, instrumentId, setInstrumentId, a4, setA4],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings deve ser usado dentro de <SettingsProvider>')
  return ctx
}
