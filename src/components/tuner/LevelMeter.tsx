interface LevelMeterProps {
  /** nível de captação em [0,1] */
  level: number
}

const SEGMENTS = 12

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Medidor de captação do microfone (estilo LED/VU), na vertical. Os segmentos
 * acesos formam uma RAMPA de índigo: fracos embaixo (mistura com o trilho) e
 * cheios no topo, passando a sensação de aumento. Abaixo: a luz de sinal e o
 * ícone de microfone.
 */
export function LevelMeter({ level }: LevelMeterProps) {
  const lit = Math.round(level * SEGMENTS)
  const active = level > 0.03

  return (
    <div
      className="flex flex-col items-center gap-2"
      aria-label={`Captação do microfone: ${Math.round(level * 100)}%`}
    >
      {/* coluna de segmentos: flex-col-reverse → índice 0 acende embaixo */}
      <div className="flex h-32 w-1.5 flex-col-reverse items-stretch gap-0.5">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < lit
          // 55% (base) → 100% de índigo conforme sobe: rampa de intensidade.
          const pct = 55 + 45 * (i / (SEGMENTS - 1))
          return (
            <span
              key={i}
              className="flex-1 rounded-sm transition-colors duration-75"
              style={{
                backgroundColor: on
                  ? `color-mix(in srgb, var(--c-brand) ${pct}%, var(--c-surface-2))`
                  : 'var(--c-surface-2)',
              }}
            />
          )
        })}
      </div>
      {/* luz: acende quando há sinal */}
      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-100 ${
          active ? 'bg-brand shadow-[0_0_8px_rgba(99,102,241,0.65)]' : 'bg-surface-2'
        }`}
      />
      {/* rótulo: microfone */}
      <MicIcon
        className={`h-3.5 w-3.5 transition-colors duration-200 ${
          active ? 'text-brand' : 'text-text-faint'
        }`}
      />
    </div>
  )
}
