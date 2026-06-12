import { useEffect, useState } from 'react'
import {
  CLARITY_THRESHOLD,
  DETECT_INTERVAL_MS,
  HOLD_MS,
  LEVEL_RELEASE,
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
  /** nível de captação do microfone em [0,1] (para o medidor). Atualiza sempre. */
  level: number
}

/** RMS → [0,1] em escala de dB (-60dB → 0, -10dB → 1). */
function normalizeLevel(rms: number): number {
  if (rms <= 0.00001) return 0
  const db = 20 * Math.log10(rms)
  return Math.max(0, Math.min(1, (db + 60) / 50))
}

/**
 * Laço de requestAnimationFrame que lê o domínio do tempo do analyser, aplica
 * gate de ruído e devolve a leitura crua + o nível de captação.
 *
 * Persistência simples e robusta: enquanto chegam quadros bons a leitura é
 * atualizada e NUNCA fica silenciosa — não trava tocando em sequência nem ao
 * trocar de corda. Só vira "silent" HOLD_MS após o último quadro bom.
 *
 * O `level` reflete o volume do microfone na hora (ataque instantâneo, queda
 * suave), independente da detecção de nota — serve de medidor de captação.
 */
export function usePitchDetection(
  analyser: AnalyserNode | null,
  sampleRate: number,
  enabled: boolean,
): PitchDetectionState {
  const [reading, setReading] = useState<RawReading | null>(null)
  const [silent, setSilent] = useState(true)
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!analyser || !enabled) {
      setSilent(true)
      setLevel(0)
      return
    }

    const buffer = new Float32Array(analyser.fftSize)
    const ctx = analyser.context as AudioContext
    let raf = 0
    let last = 0
    let lastGood = 0
    let levelEnv = 0
    let lastLevelQ = -1

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < DETECT_INTERVAL_MS) return
      last = t

      // Rede de segurança: o celular pode suspender o AudioContext após um tempo.
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {})

      analyser.getFloatTimeDomainData(buffer)
      const rms = computeRMS(buffer)

      // Medidor: ataque instantâneo, queda suave (estilo VU).
      const inst = normalizeLevel(rms)
      levelEnv = Math.max(inst, levelEnv * LEVEL_RELEASE)
      const q = Math.round(levelEnv * 40) / 40
      if (q !== lastLevelQ) {
        lastLevelQ = q
        setLevel(q)
      }

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

  return { reading, silent, level }
}
