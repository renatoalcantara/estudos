// Constantes de áudio/detecção. Centralizadas para fácil ajuste fino.

/**
 * Janela de análise. 8192 amostras (~170ms a 48kHz).
 * Importante: o YIN do pitchfinder usa internamente metade do buffer fornecido,
 * então com 8192 o lag máximo interno (~2048) cobre frequências até ~22Hz — o
 * suficiente para o grave do baixo (E1 ≈ 41Hz). Com 4096 o piso fica em ~43Hz
 * e o E1 não é detectado corretamente. A latência maior é aceitável num afinador.
 */
export const FFT_SIZE = 8192

/**
 * Abaixo deste RMS tratamos como silêncio. Mantido baixo de propósito: uma corda
 * tocada decai exponencialmente e continua identificável mesmo baixinha. A
 * confiança (clareza) é independente de amplitude, então ela — não o volume — é
 * quem filtra o ruído de fundo.
 */
export const RMS_GATE = 0.004

/** Confiança mínima (correlação normalizada no período) para aceitar a leitura. */
export const CLARITY_THRESHOLD = 0.85

/**
 * Janela de retenção: por quanto tempo a última leitura boa continua valendo
 * depois que o som cai. Deixa a nota "ressoar" na tela para o usuário ler a
 * afinação, em vez de sumir ao primeiro quadro fraco. Também evita resetar a
 * suavização em micro-quedas.
 */
export const HOLD_MS = 2200

/** Suavização: tamanho do histórico para o filtro de mediana. */
export const SMOOTHING_HISTORY = 5

/** Suavização: fator do EMA (média móvel exponencial). */
export const EMA_ALPHA = 0.2

/** Considera "afinado" quando |cents| ≤ este valor por alguns quadros. */
export const IN_TUNE_CENTS = 5

/** Solta o estado "afinado" só quando |cents| ultrapassa este valor (histerese). */
export const IN_TUNE_RELEASE_CENTS = 8

/** Quadros consecutivos dentro da faixa para travar em "afinado". */
export const IN_TUNE_FRAMES = 3

/** Faixa de frequência válida (Hz). Abaixo/acima é ignorado como ruído. */
export const MIN_FREQ = 28
export const MAX_FREQ = 1300

/** Intervalo mínimo entre detecções (ms) ~30Hz, suficiente e leve para mobile. */
export const DETECT_INTERVAL_MS = 33
