import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IN_TUNE_CENTS,
  IN_TUNE_FRAMES,
  IN_TUNE_RELEASE_CENTS,
  NOTE_LOCK_FRAMES,
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
  const prevRmsRef = useRef(0)
  // Trava de estabilidade: nota atualmente exibida e candidata em confirmação.
  const committedMidiRef = useRef<number | null>(null)
  const candMidiRef = useRef<number | null>(null)
  const candCountRef = useRef(0)
  const [reading, setReading] = useState<TunerReading | null>(null)

  const resetState = () => {
    smootherRef.current.reset()
    inTuneRef.current = false
    inTuneCountRef.current = 0
    prevRmsRef.current = 0
    committedMidiRef.current = null
    candMidiRef.current = null
    candCountRef.current = 0
    setReading(null)
  }

  // Recomeça do zero ao trocar instrumento/modo.
  useEffect(() => {
    resetState()
  }, [instrument.id, mode])

  // Em silêncio, reseta tudo para não misturar notas após uma pausa.
  useEffect(() => {
    if (silent) resetState()
  }, [silent])

  useEffect(() => {
    if (!raw || silent) return

    // Ataque (corda recém-tocada): o volume sobe de repente. Reseta a suavização
    // para a frequência convergir rápido na nota nova (a trava de estabilidade
    // abaixo é quem evita exibir o transiente ruidoso).
    const isAttack = raw.rms > prevRmsRef.current * 1.7 && raw.rms > 0.02
    prevRmsRef.current = raw.rms
    if (isAttack) smootherRef.current.reset()

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

    const candMidi = note.midi

    // Publica a leitura aplicando a histerese de "afinado".
    const commit = () => {
      if (committedMidiRef.current !== candMidi) {
        // a nota exibida vai mudar → reinicia a histerese de afinação
        committedMidiRef.current = candMidi
        inTuneRef.current = false
        inTuneCountRef.current = 0
      }
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
    }

    if (committedMidiRef.current === candMidi) {
      // mesma nota já exibida → refina continuamente (cents/ponteiro)
      candMidiRef.current = candMidi
      candCountRef.current = 0
      commit()
    } else {
      // nota diferente da exibida → só troca após NOTE_LOCK_FRAMES quadros iguais.
      // Enquanto não confirma, segura a nota anterior (não publica nada novo).
      if (candMidiRef.current === candMidi) candCountRef.current += 1
      else {
        candMidiRef.current = candMidi
        candCountRef.current = 1
      }
      if (candCountRef.current >= NOTE_LOCK_FRAMES) commit()
    }
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
