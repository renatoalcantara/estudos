import { INSTRUMENT_LIST } from '../../lib/instruments/instruments'
import type { InstrumentId } from '../../lib/instruments/types'

interface InstrumentSelectorProps {
  value: InstrumentId
  onChange: (id: InstrumentId) => void
}

/**
 * Seletor de instrumento em chips roláveis. Full-bleed: -mx-5 nega o px-5 do
 * bottom sheet (rola até a borda da tela); px-5 reinsere a margem, então a
 * primeira pílula respeita o recuo.
 */
export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Instrumento"
      className="-mx-5 flex gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                ? 'border-transparent bg-text text-bg elev-chip'
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
