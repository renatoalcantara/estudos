import { useEffect, useState } from 'react'
import {
  CLARITY_THRESHOLD,
  DETECT_INTERVAL_MS,
  HOLD_MS,
  RMS_GATE,
} from '../lib/audio/audioConstants'
import { computeRMS } from '../lib/audio/noiseGate'
import { detectPitch } from '../lib/audio/pitchDetector'

export interface RawReading {
  frequency: number
  clarity: number
  rms: number
}

export interface PitchDetectionState {
  reading: RawReading | null
  silent: boolean
}

/**
 * Laço de requestAnimationFrame que lê o domínio do tempo do analyser, aplica
 * gate de ruído e devolve a leitura crua.
 *
 * Retenção (hold): o estado só vira "silent" depois de HOLD_MS sem nenhum quadro
 * bom. Enquanto a nota ressoa (e por um tempo após), a leitura permanece estável
 * na tela — isso resolve o problema de "captar por menos de 1s e parar".
 */
export function usePitchDetection(
  analyser: AnalyserNode | null,
  sampleRate: number,
  enabled: boolean,
): PitchDetectionState {
  const [reading, setReading] = useState<RawReading | null>(null)
  const [silent, setSilent] = useState(true)

  useEffect(() => {
    if (!analyser || !enabled) {
      setSilent(true)
      return
    }

    const buffer = new Float32Array(analyser.fftSize)
    let raf = 0
    let last = 0
    let lastGood = 0

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < DETECT_INTERVAL_MS) return
      last = t

      analyser.getFloatTimeDomainData(buffer)
      const rms = computeRMS(buffer)

      let good = false
      if (rms >= RMS_GATE) {
        const result = detectPitch(buffer, sampleRate)
        if (result && result.clarity >= CLARITY_THRESHOLD) {
          good = true
          lastGood = t
          setSilent(false)
          setReading({ frequency: result.frequency, clarity: result.clarity, rms })
        }
      }

      // Sem quadro bom agora: só declara silêncio após a janela de retenção.
      // Dentro dela, mantém a última leitura visível (silent permanece false).
      if (!good && t - lastGood > HOLD_MS) {
        setSilent(true)
      }
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [analyser, sampleRate, enabled])

  return { reading, silent }
}
