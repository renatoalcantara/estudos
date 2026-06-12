import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import type { TunerMode } from '../../hooks/useTuner'
import { PATHS } from '../../routes/paths'

function GuitarIcon() {
  // Violão vetorizado pelo usuário (viewBox 40), com fill em currentColor
  // para acompanhar o tema da navbar.
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
      <path d="M16.8444 17.9941C17.4331 18.0035 17.7326 18.6288 17.305 19.0611C17.1495 19.2185 16.7508 19.3286 16.5347 19.4268C14.7271 20.2481 13.736 22.2895 14.1621 24.2225C14.3156 24.9114 14.4632 25.3776 14.2697 26.088C14.091 26.7438 13.7083 27.0784 13.3318 27.6057C13.1019 27.93 12.8967 28.271 12.7178 28.6259C11.9585 30.1364 11.5886 32.2311 12.1293 33.8643C12.571 35.1983 13.5813 36.2579 14.8304 36.8792C15.3501 37.1378 15.9072 37.3132 16.4813 37.3987C17.034 37.4817 18.0417 37.485 18.6428 37.485C20.8039 37.485 23.233 37.594 25.3096 36.9405C26.2762 36.6362 27.1697 36.0085 27.6096 35.0882C27.9549 34.3655 28.058 33.6934 28.1088 32.9139C28.2291 31.2218 27.8629 29.58 26.9951 28.1204C26.5393 27.354 25.8785 26.8149 25.6982 25.9227C25.565 25.2638 25.7209 24.8184 25.8418 24.188C25.9939 23.3954 25.9658 22.5061 25.7092 21.7401C25.2549 20.3852 24.1439 19.6655 22.8539 19.2294C22.5275 19.1191 22.4092 18.6528 22.5805 18.368C22.6359 18.25 22.8047 18.0903 22.9435 18.0728C23.5137 18.001 24.3975 18.5139 24.859 18.7901C24.9756 18.8672 25.0902 18.9473 25.2029 19.0302C26.8996 20.2929 27.408 22.2723 27.0996 24.2831C27.0383 24.7632 26.7805 25.305 26.9533 25.7882C27.1111 26.229 27.4978 26.6165 27.7685 27.0067C28.5611 28.1596 29.0779 29.4794 29.2789 30.8639C29.5269 32.5645 29.3881 34.9688 28.2863 36.3704C26.1775 39.0536 21.9355 38.7124 18.8824 38.7452C17.8478 38.7563 16.7442 38.7675 15.7662 38.5391C14.8352 38.3182 13.9593 37.9089 13.1928 37.336C10.9101 35.6149 10.2535 33.1038 10.8013 30.3876C11.1154 28.8302 11.7936 27.4518 12.8116 26.2325C13.3492 25.5884 13 24.9038 12.8863 24.1778C12.6524 22.685 13.0178 21.1968 13.9211 19.9827C14.4874 19.2161 15.2463 18.6129 16.1208 18.234C16.3364 18.1387 16.6107 18.0283 16.8444 17.9941Z" />
      <path d="M18.4276 1.25737C18.5056 1.25326 18.5838 1.25063 18.6619 1.24947C19.4343 1.24045 20.2094 1.25301 20.9821 1.24733C21.2692 1.24521 21.5747 1.23932 21.8542 1.30961C22.1481 1.38342 22.4171 1.53475 22.6327 1.74783C23.0253 2.13796 23.127 2.58896 23.1272 3.12345C23.1954 3.1214 23.2634 3.12041 23.3315 3.12048C23.6405 3.12005 23.9743 3.08589 24.202 3.32472C24.3208 3.44966 24.3811 3.61908 24.3682 3.79101C24.3571 3.96121 24.2764 4.11933 24.1452 4.22812C23.9077 4.42425 23.4268 4.40503 23.128 4.37386L23.1249 4.99621C23.4755 4.99552 23.9805 4.9363 24.2253 5.22339C24.3342 5.35164 24.3868 5.51859 24.3706 5.68615C24.3542 5.85183 24.27 6.00338 24.1382 6.10504C23.8911 6.2975 23.4288 6.28168 23.1313 6.2467C23.0995 7.1197 22.7684 7.78679 21.8835 8.0633C21.8616 8.35222 21.8757 8.84595 21.8757 9.14783V11.1169L21.8755 17.8979L21.8766 20.0146C21.8774 20.407 21.8827 20.8066 21.8729 21.1986C21.8676 21.4046 21.8114 21.5872 21.6487 21.7259C21.5218 21.8345 21.3559 21.8869 21.1895 21.8706C20.843 21.8372 20.6366 21.5853 20.6315 21.2482C20.6266 20.9101 20.6249 20.5749 20.6249 20.2367L20.6255 18.4748L20.6251 13.108V9.37988C20.6251 8.71877 20.6042 8.04033 20.6487 7.38216C20.6889 6.7874 21.3534 6.94978 21.6952 6.78607L21.7186 6.77457C21.7967 6.66937 21.8634 6.56798 21.8665 6.43298C21.8864 5.50783 21.8731 4.58351 21.8764 3.65763C21.8774 3.38171 21.9003 3.01523 21.8225 2.74906C21.7921 2.6447 21.705 2.58869 21.6093 2.54642C21.2716 2.47847 20.5448 2.51158 20.1757 2.50728C19.6704 2.50138 19.1356 2.50544 18.6291 2.51128C18.4808 2.51312 18.3314 2.54043 18.2319 2.66171C18.0829 2.84359 18.1267 3.21646 18.1265 3.44644L18.1256 4.55365L18.1252 5.75406C18.1251 5.97718 18.1164 6.21968 18.1349 6.44226C18.1756 7.0597 18.8514 6.74326 19.1798 7.0449C19.4536 7.2964 19.3783 7.90894 19.3775 8.26505L19.3757 9.59398L19.3758 13.9099L19.3767 18.7812L19.3773 20.3718C19.3773 20.6443 19.387 21.013 19.3686 21.2818C19.3601 21.4244 19.3032 21.5597 19.2072 21.6654C19.092 21.7941 18.9417 21.8761 18.767 21.88C18.6005 21.8822 18.4398 21.8181 18.3205 21.7019C18.2217 21.6072 18.1289 21.4335 18.1266 21.3019C18.1198 20.921 18.1257 20.5113 18.1258 20.1318L18.1261 17.4044L18.1233 8.06525C17.2551 7.76912 16.8685 7.16332 16.8774 6.26283C16.5547 6.2624 16.0972 6.30877 15.8486 6.10697C15.7184 6.00113 15.6386 5.84543 15.6287 5.67791C15.6098 5.39402 15.7802 5.10089 16.0561 5.03486C16.294 4.97791 16.6239 4.99724 16.8723 4.99705L16.879 4.38988C16.5459 4.39052 16.0791 4.43853 15.826 4.21271C15.6997 4.09894 15.6274 3.93707 15.627 3.76709C15.6198 3.03039 16.3733 3.11988 16.8699 3.12369C16.8772 2.10525 17.3799 1.38506 18.4276 1.25737Z" />
      <path d="M19.7591 22.5084C21.6513 22.3768 23.2923 23.8028 23.4261 25.6948C23.5599 27.5866 22.1359 29.2291 20.2441 29.3653C18.3493 29.5016 16.7033 28.0746 16.5693 26.1797C16.4352 24.2846 17.864 22.6403 19.7591 22.5084ZM20.2056 28.1098C21.4066 27.995 22.2865 26.9276 22.1701 25.7266C22.0535 24.5258 20.9847 23.6475 19.7841 23.7657C18.5859 23.8836 17.7095 24.9496 17.8258 26.1481C17.9421 27.3465 19.007 28.2244 20.2056 28.1098Z" />
      <path d="M16.8279 33.7556C17.2391 33.7397 17.6843 33.7481 18.0996 33.7479L20.2713 33.7475L22.0443 33.7477C22.3486 33.7477 23.1994 33.7073 23.4156 33.8276C23.9422 34.1206 23.8262 34.8647 23.193 34.9968C22.7971 35.0182 22.324 35.0073 21.923 35.0075L19.8015 35.0077L17.985 35.0091C17.643 35.0099 17.2887 35.0161 16.9484 35.0024C16.7803 34.9878 16.68 34.9913 16.5345 34.9001C16.2113 34.6974 16.1684 34.2903 16.3806 33.9891C16.4922 33.8308 16.6423 33.7868 16.8279 33.7556Z" />
      <path d="M18.7039 31.2561C19.5267 31.219 20.3944 31.259 21.2206 31.2559C21.9893 31.253 22.1432 32.325 21.3202 32.4973C20.4944 32.544 19.5544 32.5034 18.7236 32.4956C18.0291 32.4889 17.8357 31.4026 18.7039 31.2561Z" />
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
    <nav className="safe-x pointer-events-none pt-2 pb-[env(safe-area-inset-bottom)]">
      {/* Folga inferior = exatamente o safe-area-inset (a safe area inteira):
          rente ao fundo onde o inset é 0, e só o necessário acima do indicador
          home no iOS. px-4 num wrapper separado porque, na mesma tag, o safe-x
          (env=0 no portrait) sobrescreveria o padding. */}
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
