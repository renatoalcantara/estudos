import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setUserProperties, trackEvent } from '../lib/analytics/analytics'
import { DEFAULT_INSTRUMENT_ID } from '../lib/instruments/instruments'
import type { InstrumentId } from '../lib/instruments/types'
import { A4 } from '../lib/music/noteUtils'
import type { ThemeChoice } from '../lib/theme/tokens'
import type { TunerMode } from '../hooks/useTuner'

const KEYS = {
  theme: 'afinador:theme',
  instrument: 'afinador:instrument',
  a4: 'afinador:a4',
  mode: 'afinador:mode',
  tunings: 'afinador:tunings',
} as const

interface SettingsValue {
  theme: ThemeChoice
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: ThemeChoice) => void

  instrumentId: InstrumentId
  setInstrumentId: (id: InstrumentId) => void

  /** afinação ativa do instrumento atual */
  tuningId: string
  setTuningId: (id: string) => void

  /** modo do afinador (controlado pela navbar) */
  mode: TunerMode
  setMode: (m: TunerMode) => void

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
  const [tuningsMap, setTuningsMap] = useState<Partial<Record<InstrumentId, string>>>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.tunings) ?? '{}') as Partial<Record<InstrumentId, string>>
    } catch {
      return {}
    }
  })
  const [mode, setModeState] = useState<TunerMode>(() =>
    readStored<TunerMode>(KEYS.mode, 'instrument'),
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
    if (meta) meta.setAttribute('content', resolvedTheme === 'dark' ? '#141210' : '#f4f1ec')
    // Propriedade de usuário: tema em uso (responde "tema mais utilizado",
    // inclusive para quem nunca troca e fica no padrão 'system').
    setUserProperties({ theme: theme, theme_resolved: resolvedTheme })
  }, [resolvedTheme, theme])

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t)
    localStorage.setItem(KEYS.theme, t)
    trackEvent('select_theme', { theme: t })
  }, [])

  const tuningId = tuningsMap[instrumentId] ?? 'standard'

  const setInstrumentId = useCallback((id: InstrumentId) => {
    setInstrumentIdState(id)
    localStorage.setItem(KEYS.instrument, id)
    trackEvent('select_instrument', { instrument: id })
  }, [])

  const setTuningId = useCallback(
    (id: string) => {
      setTuningsMap((prev) => {
        const next = { ...prev, [instrumentId]: id }
        localStorage.setItem(KEYS.tunings, JSON.stringify(next))
        return next
      })
      trackEvent('select_tuning', { instrument: instrumentId, tuning: id })
    },
    [instrumentId],
  )

  const setMode = useCallback((m: TunerMode) => {
    setModeState(m)
    localStorage.setItem(KEYS.mode, m)
    trackEvent('select_mode', { mode: m })
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
      tuningId,
      setTuningId,
      mode,
      setMode,
      a4,
      setA4,
    }),
    [theme, resolvedTheme, setTheme, instrumentId, setInstrumentId, tuningId, setTuningId, mode, setMode, a4, setA4],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings deve ser usado dentro de <SettingsProvider>')
  return ctx
}
