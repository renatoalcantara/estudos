import { INSTRUMENT_LIST } from '../../lib/instruments/instruments'
import type { InstrumentId } from '../../lib/instruments/types'

interface InstrumentSelectorProps {
  value: InstrumentId
  onChange: (id: InstrumentId) => void
}

/** Seletor de instrumento em chips roláveis. */
export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Instrumento"
      className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {INSTRUMENT_LIST.map((inst) => {
        const active = inst.id === value
        return (
          <button
            key={inst.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(inst.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition duration-200 active:scale-95 ${
              active
                ? 'border-text bg-text text-bg'
                : 'border-border bg-surface text-text-soft hover:text-text'
            }`}
          >
            {inst.name}
          </button>
        )
      })}
    </div>
  )
}
