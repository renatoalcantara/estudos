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
 * Modelo de persistência simples e robusto: enquanto chegam quadros bons a
 * leitura é atualizada e NUNCA fica silenciosa — por isso não trava tocando em
 * sequência nem ao trocar de corda. Só vira "silent" HOLD_MS depois do último
 * quadro bom (a corda realmente se calou).
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
    const ctx = analyser.context as AudioContext
    let raf = 0
    let last = 0
    let lastGood = 0

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < DETECT_INTERVAL_MS) return
      last = t

      // Rede de segurança: o celular pode suspender o AudioContext após um tempo.
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {})

      analyser.getFloatTimeDomainData(buffer)
      const rms = computeRMS(buffer)

      if (rms >= RMS_GATE) {
        const r = detectPitch(buffer, sampleRate)
        if (r && r.clarity >= CLARITY_THRESHOLD) {
          lastGood = t
          setReading({ frequency: r.frequency, clarity: r.clarity, rms })
          setSilent(false)
          return
        }
      }

      // Sem quadro bom: só silencia HOLD_MS depois do último quadro bom.
      if (t - lastGood > HOLD_MS) setSilent(true)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [analyser, sampleRate, enabled])

  return { reading, silent }
}
