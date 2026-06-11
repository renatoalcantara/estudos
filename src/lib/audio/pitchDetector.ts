import { YIN } from 'pitchfinder'
import { MAX_FREQ, MIN_FREQ } from './audioConstants'

export interface PitchResult {
  /** frequência fundamental em Hz */
  frequency: number
  /** confiança em [0,1] — correlação normalizada no período detectado */
  clarity: number
}

// O detector YIN do pitchfinder é robusto para sinais monofônicos e lida bem
// com graves. Cacheamos por sample rate (iOS costuma usar 48000, não 44100).
let yinDetector: ((buf: Float32Array) => number | null) | null = null
let yinSampleRate = 0

function getYin(sampleRate: number) {
  if (!yinDetector || yinSampleRate !== sampleRate) {
    yinDetector = YIN({ sampleRate, threshold: 0.12 })
    yinSampleRate = sampleRate
  }
  return yinDetector
}

/**
 * Correlação cruzada normalizada no lag = período. Barata (O(n)) e serve como
 * medida de confiança: ~1 para uma nota limpa e periódica, baixa para ruído.
 */
function periodicityAtLag(buffer: Float32Array, lag: number): number {
  if (lag <= 0 || lag >= buffer.length) return 0
  let corr = 0
  let e0 = 0
  let e1 = 0
  for (let i = 0; i + lag < buffer.length; i++) {
    corr += buffer[i] * buffer[i + lag]
    e0 += buffer[i] * buffer[i]
    e1 += buffer[i + lag] * buffer[i + lag]
  }
  const denom = Math.sqrt(e0 * e1)
  return denom > 0 ? corr / denom : 0
}

/**
 * Autocorrelação (método de Chris Wilson) com interpolação parabólica.
 * Fallback controlável quando o YIN não retorna valor — importante para o grave.
 */
function autoCorrelate(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length

  // recorta trechos de baixa amplitude nas pontas
  const threshold = 0.2
  let r1 = 0
  let r2 = SIZE - 1
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i
      break
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) {
      r2 = SIZE - i
      break
    }
  }

  const buf = buffer.subarray(r1, r2)
  const size = buf.length
  if (size < 2) return null

  const maxLag = Math.min(size - 1, Math.floor(sampleRate / MIN_FREQ))
  const c = new Float32Array(maxLag + 1)
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0
    for (let i = 0; i < size - lag; i++) sum += buf[i] * buf[i + lag]
    c[lag] = sum
  }

  // pula o primeiro vale descendente
  let d = 0
  while (d < maxLag && c[d] > c[d + 1]) d++

  let maxVal = -Infinity
  let maxPos = -1
  for (let i = d; i <= maxLag; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i]
      maxPos = i
    }
  }
  if (maxPos <= 0) return null

  // interpolação parabólica em torno do pico
  let t0 = maxPos
  if (maxPos > 0 && maxPos < maxLag) {
    const x1 = c[maxPos - 1]
    const x2 = c[maxPos]
    const x3 = c[maxPos + 1]
    const a = (x1 + x3 - 2 * x2) / 2
    const b = (x3 - x1) / 2
    if (a !== 0) t0 = maxPos - b / (2 * a)
  }

  return sampleRate / t0
}

/**
 * Detecta a frequência fundamental do buffer (domínio do tempo).
 * Estratégia: YIN como primário, autocorrelação como fallback; a confiança
 * vem sempre da periodicidade no período detectado.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): PitchResult | null {
  const yinFreq = getYin(sampleRate)(buffer)

  let frequency: number | null = null
  if (yinFreq && yinFreq >= MIN_FREQ && yinFreq <= MAX_FREQ) {
    frequency = yinFreq
  } else {
    const acf = autoCorrelate(buffer, sampleRate)
    if (acf && acf >= MIN_FREQ && acf <= MAX_FREQ) frequency = acf
  }

  if (frequency == null) return null

  const clarity = periodicityAtLag(buffer, Math.round(sampleRate / frequency))
  return { frequency, clarity }
}
