import { useEffect, useState } from 'react'
import { CentsMeter } from '../components/tuner/CentsMeter'
import { InstrumentSelector } from '../components/tuner/InstrumentSelector'
import { LevelMeter } from '../components/tuner/LevelMeter'
import { MicPermissionPrompt } from '../components/tuner/MicPermissionPrompt'
import { NoteDisplay } from '../components/tuner/NoteDisplay'
import { StringSelector } from '../components/tuner/StringSelector'
import { TunerGauge } from '../components/tuner/TunerGauge'
import { PageHeader } from '../components/ui/PageHeader'
import { useSettings } from '../context/SettingsContext'
import { useTuner } from '../hooks/useTuner'
import { getActiveTuning, getInstrument } from '../lib/instruments/instruments'

export function TunerPage() {
  const { instrumentId, setInstrumentId, mode, a4 } = useSettings()
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)

  const instrument = getInstrument(instrumentId)
  const strings = getActiveTuning(instrument).strings

  const tuner = useTuner({ instrument, mode, manualStringIndex, a4 })
  const running = tuner.micState === 'running'
  const { start } = tuner

  // Ao trocar de instrumento, volta a corda para automático.
  useEffect(() => {
    setManualStringIndex(null)
  }, [instrumentId])

  // Se a permissão do microfone já foi concedida, inicia sozinho (sem re-perguntar).
  useEffect(() => {
    let cancelled = false
    const tryAutoStart = async () => {
      try {
        const status = await navigator.permissions?.query({
          name: 'microphone' as unknown as PermissionName,
        })
        if (!cancelled && status?.state === 'granted') void start()
      } catch {
        // Permissions API indisponível (ex.: Safari) — mantém o botão de permissão.
      }
    }
    void tryAutoStart()
    return () => {
      cancelled = true
    }
  }, [start])

  return (
    <div className="flex h-full flex-col px-4">
      <PageHeader title="Afinador" eyebrow={mode === 'chromatic' ? 'Cromático' : instrument.name} />

      {running ? (
        <div className="flex min-h-0 flex-1 flex-col pb-2">
          {/* Acima do ponteiro só há elementos constantes nos dois modos → o
              ponteiro fica fixo ao alternar Instrumento/Cromático na navbar. */}
          <LevelMeter level={tuner.level} />

          {/* Área do ponteiro: flexível e centralizada (absorve a sobra de espaço). */}
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
            <TunerGauge
              cents={tuner.reading?.cents ?? null}
              inTune={tuner.reading?.inTune ?? false}
              active={!tuner.silent && tuner.reading != null}
            />
            <NoteDisplay reading={tuner.reading} silent={tuner.silent} />
            <CentsMeter reading={tuner.reading} silent={tuner.silent} />
          </div>

          {/* Seletores abaixo do ponteiro (só no modo Instrumento). */}
          {mode === 'instrument' && (
            <div className="flex animate-fade-in flex-col gap-3">
              <InstrumentSelector value={instrumentId} onChange={setInstrumentId} />
              <StringSelector
                strings={strings}
                activeIndex={tuner.reading?.stringIndex ?? null}
                manualIndex={manualStringIndex}
                inTune={tuner.reading?.inTune ?? false}
                onSelect={setManualStringIndex}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <MicPermissionPrompt state={tuner.micState} error={tuner.error} onStart={start} />
        </div>
      )}
    </div>
  )
}
