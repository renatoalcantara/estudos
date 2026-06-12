import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

interface NavItem {
  key: string
  label: string
  icon: () => JSX.Element
}

const ITEMS: NavItem[] = [
  { key: 'instrument', label: 'Instrumento', icon: TunerIcon },
  { key: 'chromatic', label: 'Cromático', icon: NoteIcon },
  { key: 'settings', label: 'Ajustes', icon: SettingsIcon },
]

/**
 * Navegação inferior flutuante (pílula). A divisão Instrumento / Cromático é o
 * MODO do afinador (estado em SettingsContext) — alternar não desmonta a tela do
 * afinador, então o microfone continua rodando. "Ajustes" é uma rota.
 *
 * Todos os itens mostram ícone + rótulo (ativos e inativos). A pílula clara é só
 * um FUNDO deslizante que destaca o ativo: ESCORREGA (left/width medidos do item
 * ativo) até o novo slot ao trocar de seção; o conteúdo fica nos botões por cima.
 */
export function BottomNav() {
  const { mode, setMode } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const onSettings = location.pathname.startsWith('/ajustes')

  // Índice do item ativo (0: Instrumento, 1: Cromático, 2: Ajustes).
  const activeIndex = onSettings ? 2 : mode === 'chromatic' ? 1 : 0

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
    <nav className="safe-bottom safe-x pointer-events-none px-4 pb-3 pt-2">
      <div className="pointer-events-auto relative mx-auto flex max-w-md items-center justify-between rounded-full border border-border bg-surface/80 p-1.5 shadow-soft backdrop-blur-xl">
        {/* Fundo deslizante que destaca o item ativo (sem conteúdo próprio). */}
        <div
          aria-hidden="true"
          className={`absolute h-11 rounded-full bg-text ${
            ready ? 'transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
          }`}
          style={{ left: pill.left, width: pill.width }}
        />

        {ITEMS.map((item, i) => {
          const active = i === activeIndex
          const Icon = item.icon
          return (
            <button
              key={item.key}
              ref={(el) => (itemRefs.current[i] = el)}
              type="button"
              aria-current={active}
              onClick={() => select(i)}
              className={`relative z-10 flex h-11 items-center justify-center gap-2 rounded-full px-4 transition-colors duration-200 active:scale-90 ${
                active ? 'text-bg' : 'text-text-faint hover:text-text-soft'
              }`}
            >
              <Icon />
              <span className="whitespace-nowrap text-sm font-semibold">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
