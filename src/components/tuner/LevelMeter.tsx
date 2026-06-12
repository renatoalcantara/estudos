interface LevelMeterProps {
  /** nível de captação em [0,1] */
  level: number
}

const SEGMENTS = 16

/**
 * Medidor de captação do microfone (estilo LED/VU). Responde na hora ao volume
 * de entrada — serve para o usuário ver se o microfone está captando, mesmo
 * antes de a nota travar.
 */
export function LevelMeter({ level }: LevelMeterProps) {
  const lit = Math.round(level * SEGMENTS)
  const active = level > 0.03

  return (
    <div className="flex items-center gap-2 px-1" aria-label={`Captação do microfone: ${Math.round(level * 100)}%`}>
      {/* luz: acende quando há sinal */}
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-100 ${
          active ? 'bg-success shadow-glow-success' : 'bg-surface-2'
        }`}
      />
      <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">Mic</span>
      <div className="flex h-2.5 flex-1 items-stretch gap-0.5">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < lit
          const color = i >= 14 ? 'bg-error' : i >= 11 ? 'bg-brand' : 'bg-success'
          return (
            <span
              key={i}
              className={`flex-1 rounded-sm transition-colors duration-75 ${on ? color : 'bg-surface-2'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
