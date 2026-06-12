import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface PageHeaderProps {
  title: string
  /** mostra seta de voltar */
  back?: boolean
  /** eyebrow em mono (estilo DESIGN.md) */
  eyebrow?: string
  /** torna o título um botão (abre seleção de instrumento/afinação) */
  onTitlePress?: () => void
  /** fixa o header no topo durante a rolagem (com fundo opaco) */
  sticky?: boolean
}

function BackArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PageHeader({ title, back = false, eyebrow, onTitlePress, sticky = false }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header
      className={`flex items-center gap-2 px-4 pb-2 pt-1 ${
        sticky ? 'sticky top-0 z-20 bg-bg' : ''
      }`}
    >
      {back && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-text-soft hover:text-text"
        >
          <BackArrow />
        </button>
      )}
      <div className="flex items-center gap-2">
        {!back && <span className="h-3 w-3 rounded-full bg-brand" aria-hidden="true" />}
        <div>
          {eyebrow && (
            <div className="font-mono text-[11px] uppercase tracking-wide text-text-faint">
              {eyebrow}
            </div>
          )}
          {onTitlePress ? (
            <button
              onClick={onTitlePress}
              aria-haspopup="dialog"
              className="-ml-1 flex items-center gap-1.5 rounded-lg px-1 text-2xl font-semibold tracking-display text-text transition-colors hover:text-text-soft active:scale-[0.98]"
            >
              {title}
              <ChevronDown />
            </button>
          ) : (
            <h1 className="text-2xl font-semibold tracking-display text-text">{title}</h1>
          )}
        </div>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
