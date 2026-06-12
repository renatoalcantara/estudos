import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import type { TunerMode } from '../../hooks/useTuner'
import { PATHS } from '../../routes/paths'

function GuitarIcon() {
  // Violão vetorizado pelo usuário (viewBox 512), com fill em currentColor
  // para acompanhar o tema da navbar.
  return (
    <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
      <path d="M434.315 0H445.177C447.225 0.80677 449.575 1.23983 451.705 1.871C455.31 2.95015 458.775 4.4541 462.025 6.3512C471.927 12.134 479.157 20.8121 487.182 28.629C497.297 38.484 507.458 48.1325 510.658 62.4183C510.938 63.6633 511.535 66.254 512 67.3832V76.9202L511.922 77.135C510.162 82.1935 510.135 85.5235 507.12 90.8635C495.857 110.818 472.575 123.943 452.81 134.103C447.95 136.601 441.322 139 436.992 141.835C436.302 142.287 430.975 147.696 430.105 148.567L417.392 161.278L375.793 202.886C369.185 209.489 362.18 216.072 356.06 223.038C355.452 223.728 360.507 229.196 361.117 229.984C375.602 248.757 387.86 272.242 383.19 296.677C379.718 314.835 366.245 327.66 351.65 337.672C334.732 349.28 313.928 354.845 299.535 370.082C293.228 376.757 290.56 389.405 288.733 398.34C286.268 410.392 284.288 421.498 281.128 433.418C273.815 461.013 260.502 482.502 236.143 497.995C227.255 503.647 218.424 507.322 208.112 509.835C205.807 510.395 197.918 511.23 196.427 512H179.096C177.381 511.33 166.734 510.045 163.525 509.312C151.192 506.503 140.336 502.452 128.949 496.96C78.5438 472.647 30.5555 423.218 9.7125 371.133C6.444 362.938 3.91575 354.468 2.15807 345.823C1.51736 342.59 1.04251 335.87 0 333.193V315.312C0.73802 314.138 1.75157 305.835 2.315 303.53C5.60815 290.052 10.5613 280.03 18.6194 269.045C42.6597 236.271 77.181 230.305 114.58 223.034C122.84 221.428 135.14 218.503 141.446 212.694C158.406 197.07 163.552 173.923 177.435 155.836C188.309 141.67 199.689 130.926 218.191 128.273C238.434 125.37 258.368 134.393 274.723 145.543C279.798 149.003 284.105 152.777 288.943 156.388C295.615 149.181 303.898 141.265 310.908 134.254L350.57 94.5997C356.853 88.3152 363.487 81.7422 369.715 75.417C371.857 73.24 376.837 61.168 378.797 57.4157C389.067 37.8602 400.987 16.844 420.427 5.10938C425.317 2.15876 430.045 2.08337 434.315 0ZM225.61 468.85C255.728 445.435 253.213 410.027 263.203 376.672C266.21 366.63 270.645 356.738 277.927 349.105C288.622 337.898 301.175 330.51 314.927 323.745C321.872 320.327 330.36 316.005 336.58 311.483C344.547 305.688 352.665 299.2 353.84 288.785C355.427 274.693 346.247 259.71 337.86 249.043L334.3 244.549C331.02 247.477 327.525 251.135 324.39 254.273L308.142 270.55C303.61 275.087 297.493 282.64 290.79 283.485C282.698 284.505 277.922 278.737 272.777 273.585L261.01 261.802L242.687 243.473C239.341 240.125 235.95 236.834 232.714 233.378C230.595 231.116 229.658 229.39 228.957 226.357C226.71 216.635 234.295 210.838 240.429 204.719L258.405 186.789C260.615 184.585 265.653 179.823 267.473 177.609C254.893 168.138 241.433 157.241 224.525 158.095C220.117 158.707 216.025 159.484 212.401 162.319C200.004 172.018 193.076 187.398 186.141 201.021C179 215.051 170.183 228.554 157.66 238.29C149.276 244.688 136.784 248.787 126.506 251.235C94.1315 258.945 60.7132 259.485 40.3242 290.15C31.6807 303.107 29.0122 320.703 31.469 336.035C38.6985 381.158 72.6938 422.165 107.836 449.177C139.158 473.255 189.552 496.235 225.61 468.85ZM289.052 247.105C314.44 221.111 340.862 195.198 366.587 169.471L393.84 142.221C397.532 138.529 404.12 131.553 407.89 128.335C402.933 123.038 397.432 117.815 392.34 112.62C390.912 111.166 384.878 104.971 383.478 104.197L383.267 104.436C381.282 106.684 378.505 109.308 376.32 111.484L364.253 123.525L299.508 188.261L277.953 209.817C276.308 211.461 265.625 221.778 265.18 223.195C267.875 226.594 274.76 232.885 278.055 236.32C280.012 238.361 287.14 245.609 289.052 247.105ZM432.712 110.321C435.407 109.171 439.327 107.315 441.905 105.913C452.762 100.76 476.05 87.133 481.062 75.3363C482.3 72.3493 481.825 68.9647 480.457 66.1137C479.807 64.7535 478.763 63.1525 477.75 62.036C472.218 55.9295 466.17 50.243 460.383 44.3705C456.873 40.8082 453.372 37.232 449.585 33.974C445.95 30.8487 442.582 30.0657 437.99 30.5695C424.692 34.177 405.92 67.2662 401.61 79.629C409.03 86.3262 416.47 94.696 423.777 101.644C426.337 104.078 430.085 108.284 432.712 110.321Z" />
      <path d="M194.097 266.865C219.995 264.622 242.815 283.78 245.093 309.672C247.371 335.567 228.245 358.415 202.353 360.727C176.411 363.047 153.51 343.875 151.228 317.93C148.946 291.985 168.149 269.11 194.097 266.865ZM197.624 330.877C207.018 331.18 214.889 323.83 215.229 314.437C215.569 305.042 208.25 297.142 198.858 296.765C189.413 296.385 181.458 303.755 181.116 313.202C180.774 322.65 188.176 330.575 197.624 330.877Z" />
      <path d="M106.192 344.338C115.017 343.873 119.543 350.238 125.237 355.938L141.148 371.865L155.751 386.438C160.024 390.705 166.163 395.595 167.372 401.635C168.196 405.643 167.351 409.813 165.033 413.183C162.356 417.043 158.642 418.923 154.132 419.745C145.163 420.035 141.629 414.855 135.803 409.03L121.071 394.305L104.623 377.858C101.455 374.688 97.9673 371.423 95.1515 367.965C93.4783 365.908 92.7893 363.82 92.4613 361.185C91.9578 357.108 93.1128 352.998 95.667 349.778C98.414 346.31 101.928 344.798 106.192 344.338Z" />
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
    <nav
      className="absolute inset-x-0 bottom-0 safe-x pointer-events-none pt-2"
      style={{
        // Pílula flutuante: usa só uma fração do safe-area (o suficiente para
        // ficar logo acima do home indicator), não os 34px completos — que
        // deixavam um vão grande. var(--nav-debug-offset) é o ajuste fino.
        paddingBottom:
          'calc(max(env(safe-area-inset-bottom, 0px) * 0.4, 10px) + var(--nav-debug-offset, 0px))',
      }}
    >
      {/* absolute bottom-0 (não sticky/fixed): ancorado no fundo do container de
          100dvh. Folga inferior = o safe-area-inset (rente ao fundo onde é 0, e
          só o necessário acima do indicador home no iOS). px-4 num wrapper
          separado porque, na mesma tag, o safe-x (env=0 no portrait)
          sobrescreveria o padding. */}
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
