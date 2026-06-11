import { useEffect, useState } from 'react'
import {
  CLARITY_THRESHOLD,
  DETECT_INTERVAL_MS,
  HOLD_MS,
  MAX_PERSIST_MS,
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
 * Persistência: a leitura fica ativa por até MAX_PERSIST_MS (~2s) a partir do
 * início de cada toque. Repalhetar (ataque) reinicia a janela, então a nota só
 * some ~2s depois do último toque — nem curto demais, nem "preso" ressoando.
 * HOLD_MS apenas faz a ponte de micro-quedas dentro de um toque.
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
    let lastGood = 0 // instante do último quadro bom
    let onset = 0 // início do toque atual
    let prevRms = 0
    let active = false // exibindo leitura
    let capped = false // suprimido após estourar a janela num toque sustentado

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < DETECT_INTERVAL_MS) return
      last = t

      analyser.getFloatTimeDomainData(buffer)
      const rms = computeRMS(buffer)

      let result: ReturnType<typeof detectPitch> = null
      if (rms >= RMS_GATE) {
        const r = detectPitch(buffer, sampleRate)
        if (r && r.clarity >= CLARITY_THRESHOLD) result = r
      }

      const isAttack = !!result && rms > prevRms * 1.7 && rms > 0.02
      prevRms = rms

      if (result) {
        const gap = t - lastGood > HOLD_MS // houve silêncio real antes deste quadro
        lastGood = t
        if (gap) capped = false // recomeço limpo após silêncio real

        if (capped && !isAttack) {
          // mesmo toque que já estourou a janela → segue suprimido
        } else {
          if (!active || isAttack || gap) {
            onset = t // novo toque → reinicia a janela de persistência
            active = true
          }
          if (t - onset > MAX_PERSIST_MS) {
            // a janela de ~2s estourou neste toque sustentado → limpa a tela
            active = false
            capped = true
            setSilent(true)
          } else {
            setReading({ frequency: result.frequency, clarity: result.clarity, rms })
            setSilent(false)
          }
        }
      } else if (t - lastGood > HOLD_MS) {
        capped = false // silêncio real
        if (active) {
          active = false
          setSilent(true)
        }
      }
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [analyser, sampleRate, enabled])

  return { reading, silent }
}
