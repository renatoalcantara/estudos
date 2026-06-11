import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IN_TUNE_CENTS,
  IN_TUNE_FRAMES,
  IN_TUNE_RELEASE_CENTS,
} from '../lib/audio/audioConstants'
import { FrequencySmoother } from '../lib/audio/smoothing'
import { getActiveTuning } from '../lib/instruments/instruments'
import type { Instrument } from '../lib/instruments/types'
import {
  analyzeFrequency,
  centsBetween,
  midiToFreq,
  noteToMidi,
  type NoteInfo,
} from '../lib/music/noteUtils'
import { useMicrophone, type MicState } from './useMicrophone'
import { usePitchDetection } from './usePitchDetection'

export type TunerMode = 'instrument' | 'chromatic'

export interface TunerReading {
  /** frequência suavizada em Hz */
  frequency: number
  /** nota temperada mais próxima (sempre disponível) */
  note: NoteInfo
  /** rótulo do alvo: corda (E2) no modo instrumento, ou nota no cromático */
  targetLabel: string
  targetFreq: number
  /** desvio em cents em relação ao alvo */
  cents: number
  inTune: boolean
  /** índice da corda ativa (modo instrumento) ou null (cromático) */
  stringIndex: number | null
  clarity: number
}

export interface TunerEngineParams {
  instrument: Instrument
  mode: TunerMode
  /** corda fixada manualmente; null = detecção automática da corda mais próxima */
  manualStringIndex: number | null
  a4: number
}

export interface TunerEngine {
  micState: MicState
  error: string | null
  start: () => Promise<void>
  stop: () => void
  silent: boolean
  reading: TunerReading | null
  /** frequências-alvo de cada corda do instrumento ativo */
  stringFreqs: number[]
}

export function useTuner({
  instrument,
  mode,
  manualStringIndex,
  a4,
}: TunerEngineParams): TunerEngine {
  const mic = useMicrophone()
  const enabled = mic.state === 'running'
  const { reading: raw, silent } = usePitchDetection(mic.analyser, mic.sampleRate, enabled)

  const tuning = useMemo(() => getActiveTuning(instrument), [instrument])
  const stringFreqs = useMemo(
    () => tuning.strings.map((s) => midiToFreq(noteToMidi(s.note, s.octave), a4)),
    [tuning, a4],
  )

  const smootherRef = useRef(new FrequencySmoother())
  const inTuneRef = useRef(false)
  const inTuneCountRef = useRef(0)
  const [reading, setReading] = useState<TunerReading | null>(null)

  // Recomeça do zero ao trocar instrumento/modo.
  useEffect(() => {
    smootherRef.current.reset()
    inTuneRef.current = false
    inTuneCountRef.current = 0
  }, [instrument.id, mode])

  // Em silêncio, reseta a suavização para não misturar notas após uma pausa.
  useEffect(() => {
    if (silent) {
      smootherRef.current.reset()
      inTuneRef.current = false
      inTuneCountRef.current = 0
    }
  }, [silent])

  useEffect(() => {
    if (!raw || silent) return

    const freq = smootherRef.current.push(raw.frequency)
    const note = analyzeFrequency(freq, a4)

    let targetFreq: number
    let targetLabel: string
    let stringIndex: number | null = null
    let cents: number

    if (mode === 'chromatic') {
      targetFreq = note.targetFreq
      cents = note.centsOff
      targetLabel = `${note.noteName}${note.octave}`
    } else {
      let idx = manualStringIndex
      if (idx == null) {
        let best = 0
        let bestAbs = Infinity
        stringFreqs.forEach((tf, i) => {
          const c = Math.abs(centsBetween(freq, tf))
          if (c < bestAbs) {
            bestAbs = c
            best = i
          }
        })
        idx = best
      }
      stringIndex = idx
      targetFreq = stringFreqs[idx]
      cents = centsBetween(freq, targetFreq)
      const st = tuning.strings[idx]
      targetLabel = `${st.note}${st.octave}`
    }

    // Histerese do estado "afinado" para não piscar na fronteira.
    const absCents = Math.abs(cents)
    if (!inTuneRef.current) {
      if (absCents <= IN_TUNE_CENTS) {
        inTuneCountRef.current += 1
        if (inTuneCountRef.current >= IN_TUNE_FRAMES) inTuneRef.current = true
      } else {
        inTuneCountRef.current = 0
      }
    } else if (absCents > IN_TUNE_RELEASE_CENTS) {
      inTuneRef.current = false
      inTuneCountRef.current = 0
    }

    setReading({
      frequency: freq,
      note,
      targetLabel,
      targetFreq,
      cents,
      inTune: inTuneRef.current,
      stringIndex,
      clarity: raw.clarity,
    })
  }, [raw, silent, mode, manualStringIndex, a4, stringFreqs, tuning])

  return {
    micState: mic.state,
    error: mic.error,
    start: mic.start,
    stop: mic.stop,
    silent,
    reading,
    stringFreqs,
  }
}
