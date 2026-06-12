import { useLocation, useNavigate } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import type { TunerMode } from '../../hooks/useTuner'
import { PATHS } from '../../routes/paths'

function TunerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v6m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 6v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M5 7v3M19 7v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="18" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="16" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.6 18V7l9.8-2v11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2a1.7 1.7 0 0 1 1.7 1.4l.1.6a1.7 1.7 0 0 0 2.5 1.1l.5-.3a1.7 1.7 0 0 1 2.2 2.5l-.3.5a1.7 1.7 0 0 0 1.1 2.5l.6.1a1.7 1.7 0 0 1 0 3.2l-.6.1a1.7 1.7 0 0 0-1.1 2.5l.3.5a1.7 1.7 0 0 1-2.2 2.5l-.5-.3a1.7 1.7 0 0 0-2.5 1.1l-.1.6a1.7 1.7 0 0 1-3.4 0l-.1-.6a1.7 1.7 0 0 0-2.5-1.1l-.5.3a1.7 1.7 0 0 1-2.2-2.5l.3-.5a1.7 1.7 0 0 0-1.1-2.5l-.6-.1a1.7 1.7 0 0 1 0-3.2l.6-.1A1.7 1.7 0 0 0 4.9 7l-.3-.5a1.7 1.7 0 0 1 2.2-2.5l.5.3A1.7 1.7 0 0 0 9.8 3.4l.1-.6A1.7 1.7 0 0 1 12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function itemClass(active: boolean): string {
  return `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition duration-200 active:scale-90 ${
    active ? 'text-brand' : 'text-text-faint hover:text-text-soft'
  }`
}

/**
 * Navegação inferior. A divisão Instrumento / Cromático é o MODO do afinador
 * (estado em SettingsContext) — alternar não desmonta a tela do afinador, então
 * o microfone continua rodando. "Ajustes" é uma rota.
 */
export function BottomNav() {
  const { mode, setMode } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const onSettings = location.pathname.startsWith('/ajustes')
  const onTuner = !onSettings

  const selectMode = (m: TunerMode) => {
    setMode(m)
    if (location.pathname !== PATHS.tuner) navigate(PATHS.tuner)
  }

  return (
    <nav className="safe-bottom safe-x border-t border-border bg-surface">
      <div className="mx-auto flex max-w-md items-stretch">
        <button
          type="button"
          aria-current={onTuner && mode === 'instrument'}
          onClick={() => selectMode('instrument')}
          className={itemClass(onTuner && mode === 'instrument')}
        >
          <TunerIcon />
          Instrumento
        </button>
        <button
          type="button"
          aria-current={onTuner && mode === 'chromatic'}
          onClick={() => selectMode('chromatic')}
          className={itemClass(onTuner && mode === 'chromatic')}
        >
          <NoteIcon />
          Cromático
        </button>
        <button
          type="button"
          aria-current={onSettings}
          onClick={() => navigate(PATHS.settings)}
          className={itemClass(onSettings)}
        >
          <SettingsIcon />
          Ajustes
        </button>
      </div>
    </nav>
  )
}
