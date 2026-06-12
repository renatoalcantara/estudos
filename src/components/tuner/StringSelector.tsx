import type { StringSpec } from '../../lib/instruments/types'
import { solfegeOf } from '../../lib/music/noteUtils'

interface StringSelectorProps {
  strings: StringSpec[]
  /** corda detectada automaticamente agora (ou null) */
  activeIndex: number | null
  /** corda fixada manualmente (ou null = automático) */
  manualIndex: number | null
  inTune: boolean
  /** alterna a corda: passa o índice ou null para voltar ao automático */
  onSelect: (index: number | null) => void
}

/**
 * Cordas como "pegs" tateáveis sobre um trilho recuado (estilo braço/tarraxas).
 * Toque para fixar (manual); toque de novo para voltar ao automático.
 */
export function StringSelector({
  strings,
  activeIndex,
  manualIndex,
  inTune,
  onSelect,
}: StringSelectorProps) {
  const targetIndex = manualIndex ?? activeIndex

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="dial-well flex items-center gap-1.5 p-1.5">
        {strings.map((s, i) => {
          const isTarget = i === targetIndex
          const isManual = i === manualIndex
          const look = isTarget
            ? inTune
              ? 'bg-brand text-white shadow-glow-success'
              : 'bg-text text-bg elev-chip'
            : 'bg-surface text-text-soft hover:text-text elev-chip'
          return (
            <button
              key={`${s.label}-${i}`}
              aria-label={`Corda ${s.label} (${solfegeOf(s.note)})`}
              aria-pressed={isManual}
              onClick={() => onSelect(isManual ? null : i)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`relative flex h-10 w-10 animate-pop-in items-center justify-center rounded-full text-sm font-semibold transition duration-200 active:scale-90 ${look}`}
            >
              {s.note}
              <span className="text-[10px] opacity-70">{s.octave}</span>
              {isManual && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pop-in rounded-full bg-brand ring-2 ring-bg" />
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-text-faint">
        {manualIndex == null ? 'Detecção automática da corda' : 'Corda fixada · toque para liberar'}
      </p>
    </div>
  )
}
