/** RMS (energia) do buffer de áudio no domínio do tempo. */
export function computeRMS(buffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}

/** Verdadeiro quando o sinal está abaixo do limiar (silêncio). */
export function isSilent(buffer: Float32Array, gate: number): boolean {
  return computeRMS(buffer) < gate
}
