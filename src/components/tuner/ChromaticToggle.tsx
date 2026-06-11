import type { TunerMode } from '../../hooks/useTuner'
import { SegmentedControl } from '../ui/SegmentedControl'

interface ChromaticToggleProps {
  mode: TunerMode
  onChange: (mode: TunerMode) => void
}

/** Alterna entre afinar pelas cordas do instrumento ou de forma cromática. */
export function ChromaticToggle({ mode, onChange }: ChromaticToggleProps) {
  return (
    <SegmentedControl<TunerMode>
      ariaLabel="Modo de afinação"
      value={mode}
      onChange={onChange}
      options={[
        { value: 'instrument', label: 'Instrumento' },
        { value: 'chromatic', label: 'Cromático' },
      ]}
    />
  )
}
