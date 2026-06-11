import { EMA_ALPHA, SMOOTHING_HISTORY } from './audioConstants'

/**
 * Suaviza a frequência detectada para um ponteiro estável:
 *  1. guarda de oitava (corrige saltos para o dobro/metade);
 *  2. filtro de mediana (mata outliers de um quadro);
 *  3. EMA (média móvel exponencial) para o movimento final do ponteiro.
 */
export class FrequencySmoother {
  private history: number[] = []
  private ema: number | null = null

  constructor(
    private historySize = SMOOTHING_HISTORY,
    private alpha = EMA_ALPHA,
  ) {}

  reset(): void {
    this.history = []
    this.ema = null
  }

  push(freq: number): number {
    // Guarda de oitava: se a leitura está muito próxima do dobro/metade do
    // valor atual, é provável erro de oitava — corrige.
    if (this.ema) {
      const ratio = freq / this.ema
      if (Math.abs(ratio - 2) < 0.06) freq /= 2
      else if (Math.abs(ratio - 0.5) < 0.03) freq *= 2
    }

    this.history.push(freq)
    if (this.history.length > this.historySize) this.history.shift()

    const sorted = [...this.history].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]

    this.ema = this.ema == null ? median : this.alpha * median + (1 - this.alpha) * this.ema
    return this.ema
  }
}
