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
 * Ganho de entrada aplicado por um GainNode entre o microfone e o analisador.
 * Aumenta o nível de captação (medidor + sensibilidade da detecção). Não distorce
 * a detecção de tom (que é normalizada). Suba para captar ainda mais; abaixe se o
 * medidor ficar "estourado" no topo o tempo todo.
 */
export const INPUT_GAIN = 2

/**
 * Abaixo deste RMS tratamos como silêncio. Baixo para captar bem (inclusive
 * palhetadas suaves e o decaimento da corda). O medidor de captação mostra o
 * nível mesmo abaixo deste valor.
 */
export const RMS_GATE = 0.004

/**
 * Confiança mínima (correlação normalizada no período) para aceitar a leitura.
 * Mais baixa = trava mais rápido logo após a palhetada (quando a janela ainda
 * está se enchendo da nota), ao custo de um pouco mais de ruído.
 */
export const CLARITY_THRESHOLD = 0.78

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
export const NOTE_LOCK_FRAMES = 3

/** Faixa de frequência válida (Hz). Abaixo/acima é ignorado como ruído. */
export const MIN_FREQ = 28
export const MAX_FREQ = 1300

/** Intervalo mínimo entre detecções (ms) ~40Hz — mais responsivo à palhetada. */
export const DETECT_INTERVAL_MS = 25

/** Release do medidor de nível por quadro (ataque instantâneo, queda suave). */
export const LEVEL_RELEASE = 0.82
