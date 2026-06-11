import type { TunerReading } from '../../hooks/useTuner'

interface NoteDisplayProps {
  reading: TunerReading | null
  silent: boolean
}

/** Nota detectada em destaque: letra+oitava, solfejo e frequência em Hz. */
export function NoteDisplay({ reading, silent }: NoteDisplayProps) {
  if (!reading) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-7xl font-semibold tracking-display text-text-faint">—</div>
        <p className="mt-1 text-sm text-text-faint">Toque uma corda</p>
      </div>
    )
  }

  const { note, frequency } = reading
  const dimmed = silent ? 'opacity-40' : ''

  return (
    <div className={`flex flex-col items-center transition-opacity ${dimmed}`}>
      <div className="flex items-start text-text">
        <span className="text-7xl font-semibold leading-none tracking-display">
          {note.noteName}
        </span>
        <span className="ml-1 mt-2 text-2xl font-medium text-text-soft">{note.octave}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-base text-text-soft">{note.solfege}</span>
        <span className="font-mono text-sm text-text-faint">{frequency.toFixed(1)} Hz</span>
      </div>
    </div>
  )
}
