import { useEffect, useState } from 'react'
import { CLARITY_THRESHOLD, DETECT_INTERVAL_MS, RMS_GATE } from '../lib/audio/audioConstants'
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
 * gate de ruído e devolve a leitura crua. A última leitura é mantida quando há
 * silêncio (apenas `silent` muda), evitando piscar a interface.
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

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < DETECT_INTERVAL_MS) return
      last = t

      analyser.getFloatTimeDomainData(buffer)
      const rms = computeRMS(buffer)
      if (rms < RMS_GATE) {
        setSilent(true)
        return
      }

      const result = detectPitch(buffer, sampleRate)
      if (result && result.clarity >= CLARITY_THRESHOLD) {
        setSilent(false)
        setReading({ frequency: result.frequency, clarity: result.clarity, rms })
      } else {
        setSilent(true)
      }
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [analyser, sampleRate, enabled])

  return { reading, silent }
}
