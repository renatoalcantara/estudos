import type { Tuning } from '../../lib/instruments/types'

interface TuningSelectorProps {
  tunings: Tuning[]
  value: string
  onChange: (id: string) => void
}

/** Seletor de afinação em chips roláveis. Só renderiza quando há mais de uma opção. */
export function TuningSelector({ tunings, value, onChange }: TuningSelectorProps) {
  if (tunings.length <= 1) return null

  return (
    <div
      role="radiogroup"
      aria-label="Afinação"
      className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {tunings.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={active}
            aria-label={t.name}
            onClick={() => onChange(t.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition duration-200 active:scale-95 ${
              active
                ? 'border-transparent bg-text text-bg elev-chip'
                : 'border-border bg-surface text-text-soft hover:text-text'
            }`}
          >
            {t.shortName}
          </button>
        )
      })}
    </div>
  )
}
