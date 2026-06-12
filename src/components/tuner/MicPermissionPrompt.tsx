import type { MicState } from '../../hooks/useMicrophone'
import { Button } from '../ui/Button'

interface MicPermissionPromptProps {
  state: MicState
  error: string | null
  onStart: () => void
}

function MicIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

const MESSAGES: Record<MicState, { title: string; body: string } | null> = {
  idle: {
    title: 'Permita o microfone para começar',
    body: 'Vamos ouvir o seu instrumento para detectar a afinação.',
  },
  requesting: { title: 'Solicitando acesso…', body: 'Confirme a permissão do microfone.' },
  denied: {
    title: 'Acesso ao microfone negado',
    body: 'Habilite o microfone nas permissões do navegador e tente de novo.',
  },
  error: { title: 'Não foi possível acessar o microfone', body: '' },
  unsupported: {
    title: 'Microfone indisponível',
    body: 'Seu navegador não suporta captura de áudio. Tente um navegador recente via HTTPS.',
  },
  running: null,
}

/** Tela inicial / de permissão do microfone (gesto do usuário obrigatório no iOS). */
export function MicPermissionPrompt({ state, error, onStart }: MicPermissionPromptProps) {
  const msg = MESSAGES[state]
  if (!msg) return null

  const showButton = state === 'idle' || state === 'denied' || state === 'error'

  const iconAnim = state === 'idle' || state === 'requesting' ? 'animate-pulse-soft' : ''

  return (
    <div className="flex animate-fade-in-up flex-col items-center gap-4 px-6 text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 text-brand ${iconAnim}`}
      >
        <MicIcon />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-text">{msg.title}</h2>
        <p className="mt-1 max-w-xs text-sm text-text-soft">{error || msg.body}</p>
      </div>
      {showButton && (
        <Button variant="brand" onClick={onStart}>
          {state === 'idle' ? 'Permitir microfone' : 'Tentar novamente'}
        </Button>
      )}
      <p className="max-w-xs text-xs text-text-faint">
        O áudio é processado no seu aparelho e nunca é enviado para a internet.
      </p>
    </div>
  )
}
