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
        <div className="text-6xl font-semibold tracking-display text-text-faint">—</div>
        <p className="mt-1 text-sm text-text-faint">Toque uma corda</p>
      </div>
    )
  }

  const { note, frequency, inTune } = reading
  const dimmed = silent ? 'opacity-40' : ''
  const noteKey = `${note.noteName}${note.octave}`

  return (
    <div className={`flex flex-col items-center transition-opacity duration-300 ${dimmed}`}>
      {/* wrapper externo: pulso contínuo quando afinado */}
      <div className={inTune ? 'animate-in-tune-pulse' : ''}>
        {/* interno: key muda só quando a nota muda → dispara o "pop" */}
        <div
          key={noteKey}
          className={`flex animate-note-pop items-start transition-colors duration-300 ${
            inTune ? 'text-success' : 'text-text'
          }`}
        >
          <span className="text-6xl font-semibold leading-none tracking-display">
            {note.noteName}
          </span>
          <span className="ml-1 mt-1 text-xl font-medium opacity-70">{note.octave}</span>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-base text-text-soft">{note.solfege}</span>
        <span className="font-mono text-sm text-text-faint tabular-nums">
          {frequency.toFixed(1)} Hz
        </span>
      </div>
    </div>
  )
}
