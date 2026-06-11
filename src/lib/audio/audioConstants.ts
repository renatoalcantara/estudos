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
 * Abaixo deste RMS tratamos como silêncio. Baixo o suficiente para acompanhar o
 * decaimento da corda, mas alto o bastante para que a cauda quase inaudível pare
 * de contar (senão a nota fica "presa" na tela por tempo demais).
 */
export const RMS_GATE = 0.006

/** Confiança mínima (correlação normalizada no período) para aceitar a leitura. */
export const CLARITY_THRESHOLD = 0.85

/**
 * Retenção: por quanto tempo a nota continua na tela DEPOIS que o som cai abaixo
 * do gate. Enquanto a corda soa, chegam quadros bons e a leitura NUNCA é cortada
 * (modelo simples por "último quadro bom" — não depende de detectar palhetadas,
 * então não trava tocando em sequência nem ao trocar de corda). A nota só some
 * ~HOLD_MS depois que a corda realmente se cala.
 */
export const HOLD_MS = 900

/**
 * Detecção de ataque (palhetada): borda de subida do volume. Usada para resetar
 * a suavização e "saltar" para a nota nova rapidamente.
 */
export const ATTACK_RATIO = 1.6
export const ATTACK_FLOOR = 0.015

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

/**
 * Quadros consecutivos exigidos para TROCAR a nota exibida. Durante o transiente
 * do ataque (palhetada), o detector cospe notas erradas por 1–2 quadros; segurar
 * a nota anterior até a nova se confirmar evita mostrar tons intermediários.
 */
export const NOTE_LOCK_FRAMES = 4

/** Faixa de frequência válida (Hz). Abaixo/acima é ignorado como ruído. */
export const MIN_FREQ = 28
export const MAX_FREQ = 1300

/** Intervalo mínimo entre detecções (ms) ~30Hz, suficiente e leve para mobile. */
export const DETECT_INTERVAL_MS = 33
