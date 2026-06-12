import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import type { TunerMode } from '../../hooks/useTuner'
import { PATHS } from '../../routes/paths'

function GuitarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* braço + headstock */}
        <path d="m14 10 5.2-5.2" />
        <path d="m18.4 3.6 2 2" />
        {/* corpo em forma de 8 (violão) */}
        <path d="M14 10c-1.5-1.5-3.9-1.4-5.4.1-.9.9-1 1.9-.7 2.8.3 1-.1 1.7-.8 2.4-1.5 1.5-1.6 3.9-.1 5.4s3.9 1.4 5.4-.1c.7-.7 1.4-1.1 2.4-.8.9.3 1.9.2 2.8-.7 1.5-1.5 1.6-3.9.1-5.4" />
        {/* boca */}
        <circle cx="11.2" cy="14.8" r="1.5" />
      </g>
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

interface NavItem {
  key: string
  label: string
  icon: () => JSX.Element
}

const ITEMS: NavItem[] = [
  { key: 'instrument', label: 'Instrumento', icon: GuitarIcon },
  { key: 'chromatic', label: 'Cromático', icon: NoteIcon },
  { key: 'settings', label: 'Ajustes', icon: SettingsIcon },
]

/**
 * Navegação inferior flutuante (pílula). A divisão Instrumento / Cromático é o
 * MODO do afinador (estado em SettingsContext) — alternar não desmonta a tela do
 * afinador, então o microfone continua rodando. "Ajustes" é uma rota.
 *
 * Item ativo: pílula clara com ícone + rótulo; inativos são só ícones. A pílula
 * carrega o próprio conteúdo e ESCORREGA (left/width medidos do item ativo) até
 * o novo slot ao trocar de seção.
 */
export function BottomNav() {
  const { mode, setMode } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const onSettings = location.pathname.startsWith('/ajustes')

  // Índice do item ativo (0: Instrumento, 1: Cromático, 2: Ajustes).
  const activeIndex = onSettings ? 2 : mode === 'chromatic' ? 1 : 0
  const ActiveIcon = ITEMS[activeIndex].icon

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  // Sem transição no primeiro posicionamento (evita a pílula "crescer" do canto).
  const [ready, setReady] = useState(false)

  // Mede o botão ativo e reposiciona a pílula. offsetLeft/Width são relativos
  // ao container (offsetParent), então funcionam sem getBoundingClientRect.
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[activeIndex]
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    // Re-mede quando a fonte termina de carregar (a largura do rótulo muda).
    document.fonts?.ready.then(measure).catch(() => {})
  }, [activeIndex])

  // Habilita a animação só depois do primeiro posicionamento.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const select = (index: number) => {
    if (index === 2) {
      navigate(PATHS.settings)
      return
    }
    const m: TunerMode = index === 1 ? 'chromatic' : 'instrument'
    setMode(m)
    if (location.pathname !== PATHS.tuner) navigate(PATHS.tuner)
  }

  return (
    <nav className="safe-bottom safe-x pointer-events-none pb-3 pt-2">
      {/* px-4 num wrapper separado: no mesmo elemento, o safe-x (env=0 no
          portrait) sobrescreveria o padding e a barra colaria nas bordas. */}
      <div className="px-4">
        <div className="pointer-events-auto relative mx-auto flex max-w-md items-center justify-between rounded-full border border-border bg-surface p-1.5 shadow-soft">
        {/* Pílula deslizante (índigo) com o conteúdo do item ativo. */}
        <div
          aria-hidden="true"
          className={`absolute flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-white shadow-[0_2px_12px_-2px_rgba(99,102,241,0.55)] ${
            ready ? 'transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
          }`}
          style={{ left: pill.left, width: pill.width }}
        >
          <ActiveIcon />
          <span className="whitespace-nowrap text-sm font-semibold">{ITEMS[activeIndex].label}</span>
        </div>

        {ITEMS.map((item, i) => {
          const active = i === activeIndex
          const Icon = item.icon
          return (
            <button
              key={item.key}
              ref={(el) => (itemRefs.current[i] = el)}
              type="button"
              aria-current={active}
              aria-label={item.label}
              onClick={() => select(i)}
              className={`relative z-10 flex h-11 items-center justify-center rounded-full transition-colors duration-200 active:scale-90 ${
                active ? 'gap-2 px-4 text-white' : 'w-11 text-text-faint hover:text-text'
              }`}
            >
              <Icon />
              {/* Rótulo presente só no ativo, para reservar a largura que a pílula
                  copia. Invisível: quem o exibe é a pílula por cima. */}
              {active && (
                <span className="whitespace-nowrap text-sm font-semibold opacity-0">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
