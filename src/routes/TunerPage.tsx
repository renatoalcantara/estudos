import { useEffect, useState } from 'react'
import { CentsMeter } from '../components/tuner/CentsMeter'
import { ChromaticToggle } from '../components/tuner/ChromaticToggle'
import { InstrumentSelector } from '../components/tuner/InstrumentSelector'
import { LevelMeter } from '../components/tuner/LevelMeter'
import { MicPermissionPrompt } from '../components/tuner/MicPermissionPrompt'
import { NoteDisplay } from '../components/tuner/NoteDisplay'
import { StringSelector } from '../components/tuner/StringSelector'
import { TunerGauge } from '../components/tuner/TunerGauge'
import { PageHeader } from '../components/ui/PageHeader'
import { useSettings } from '../context/SettingsContext'
import { useTuner, type TunerMode } from '../hooks/useTuner'
import { getActiveTuning, getInstrument } from '../lib/instruments/instruments'

export function TunerPage() {
  const { instrumentId, setInstrumentId, a4 } = useSettings()
  const [mode, setMode] = useState<TunerMode>('instrument')
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)

  const instrument = getInstrument(instrumentId)
  const strings = getActiveTuning(instrument).strings

  const tuner = useTuner({ instrument, mode, manualStringIndex, a4 })
  const running = tuner.micState === 'running'

  // Ao trocar de instrumento, volta a corda para automático.
  useEffect(() => {
    setManualStringIndex(null)
  }, [instrumentId])

  return (
    <div className="flex flex-col gap-5 px-4 pb-6">
      <PageHeader title="Afinador" eyebrow={mode === 'chromatic' ? 'Cromático' : instrument.name} />

      {/* 1º nível: modo (Instrumento / Cromático) */}
      <div className="flex justify-center">
        <ChromaticToggle mode={mode} onChange={setMode} />
      </div>

      {/* Instrumentos — só fazem sentido no modo Instrumento */}
      {mode === 'instrument' && (
        <div className="animate-fade-in">
          <InstrumentSelector value={instrumentId} onChange={setInstrumentId} />
        </div>
      )}

      {running ? (
        <>
          <LevelMeter level={tuner.level} />

          <div className="flex flex-col items-center gap-3 pt-1">
            <TunerGauge
              cents={tuner.reading?.cents ?? null}
              inTune={tuner.reading?.inTune ?? false}
              active={!tuner.silent && tuner.reading != null}
            />
            <NoteDisplay reading={tuner.reading} silent={tuner.silent} />
            <CentsMeter reading={tuner.reading} silent={tuner.silent} />
          </div>

          {mode === 'instrument' && (
            <StringSelector
              strings={strings}
              activeIndex={tuner.reading?.stringIndex ?? null}
              manualIndex={manualStringIndex}
              inTune={tuner.reading?.inTune ?? false}
              onSelect={setManualStringIndex}
            />
          )}
        </>
      ) : (
        <div className="pt-10">
          <MicPermissionPrompt state={tuner.micState} error={tuner.error} onStart={tuner.start} />
        </div>
      )}
    </div>
  )
}
