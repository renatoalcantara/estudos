import { useCallback, useEffect, useRef, useState } from 'react'
import { FFT_SIZE, INPUT_GAIN } from '../lib/audio/audioConstants'

export type MicState = 'idle' | 'requesting' | 'running' | 'denied' | 'error' | 'unsupported'

/**
 * Bypass de microfone em ambiente local: em vez de pedir permissão e ler o
 * microfone, injeta um tom sintético (oscilador) direto no analisador. Toda a
 * cadeia de detecção roda normalmente, então o afinador funciona sem mic nem
 * instrumento — ideal para desenvolver a UI.
 *
 * Ligado por padrão em `npm run dev`. Para usar o microfone REAL em dev, rode
 * com `VITE_FAKE_MIC=0`.
 */
const FAKE_MIC = import.meta.env.DEV && import.meta.env.VITE_FAKE_MIC !== '0'

export interface MicHandle {
  state: MicState
  error: string | null
  analyser: AnalyserNode | null
  sampleRate: number
  start: () => Promise<void>
  stop: () => void
}

type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext ??
    null
  )
}

const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: false,
    autoGainControl: false,
    noiseSuppression: false,
  },
}

/**
 * Gerencia o ciclo de vida do microfone: getUserMedia + AudioContext + AnalyserNode.
 * `start()` DEVE ser chamado dentro de um gesto do usuário (exigência do iOS Safari).
 *
 * Auto-recuperação: em celular a faixa de áudio pode "morrer" (bloqueio de tela,
 * interrupção do SO, outro app pegando o microfone) e a detecção pararia para
 * sempre. Aqui detectamos isso (evento `ended` da faixa e volta do segundo plano)
 * e readquirimos o microfone automaticamente.
 */
export function useMicrophone(): MicHandle {
  const [state, setState] = useState<MicState>('idle')
  const [error, setError] = useState<string | null>(null)
  // analyser/sampleRate em estado para disparar re-render quando ficarem prontos
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [sampleRate, setSampleRate] = useState(44100)

  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const wantRunningRef = useRef(false)
  const reacquiringRef = useRef(false)
  const reacquireRef = useRef<() => void>(() => {})
  // Osciladores do sinal de teste (modo FAKE_MIC).
  const oscRef = useRef<OscillatorNode | null>(null)
  const lfoRef = useRef<OscillatorNode | null>(null)

  // Monta source + analyser num contexto e publica o analyser para os consumidores.
  const buildGraph = useCallback((stream: MediaStream, ctx: AudioContext) => {
    const source = ctx.createMediaStreamSource(stream)
    // Ganho de entrada: amplifica o sinal que alimenta o analisador (captação).
    const gain = ctx.createGain()
    gain.gain.value = INPUT_GAIN
    const node = ctx.createAnalyser()
    node.fftSize = FFT_SIZE
    node.smoothingTimeConstant = 0
    source.connect(gain)
    gain.connect(node)

    setAnalyser(node)
    setSampleRate(ctx.sampleRate)

    // Se a faixa do microfone encerrar, tenta readquirir automaticamente.
    const track = stream.getAudioTracks()[0]
    if (track) {
      track.onended = () => {
        if (wantRunningRef.current) reacquireRef.current()
      }
    }
  }, [])

  // Monta um tom de teste (E2 dente-de-serra) com varredura lenta de ±35 cents,
  // ligado direto ao analisador (sem saída de áudio — não toca alto-falante).
  const buildFakeGraph = useCallback((ctx: AudioContext) => {
    const node = ctx.createAnalyser()
    node.fftSize = FFT_SIZE
    node.smoothingTimeConstant = 0

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 82.41 // E2

    // LFO modulando o detune → o ponteiro passa de desafinado a afinado e volta.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.15
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 35 // ±35 cents
    lfo.connect(lfoGain)
    lfoGain.connect(osc.detune)

    const gain = ctx.createGain()
    gain.gain.value = 0.25
    osc.connect(gain)
    gain.connect(node)

    osc.start()
    lfo.start()
    oscRef.current = osc
    lfoRef.current = lfo

    setAnalyser(node)
    setSampleRate(ctx.sampleRate)
  }, [])

  const reacquire = useCallback(async () => {
    if (FAKE_MIC) return // sinal de teste não readquire microfone
    if (!wantRunningRef.current || reacquiringRef.current) return
    const AC = getAudioContextCtor()
    if (!AC || !navigator.mediaDevices?.getUserMedia) return
    reacquiringRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = stream

      let ctx = ctxRef.current
      if (!ctx || ctx.state === 'closed') {
        ctx = new AC()
        ctxRef.current = ctx
      }
      await ctx.resume()
      buildGraph(stream, ctx)
      setState('running')
    } catch {
      // Mantém o estado atual; o usuário ainda pode tentar novamente.
    } finally {
      reacquiringRef.current = false
    }
  }, [buildGraph])

  reacquireRef.current = reacquire

  const stop = useCallback(() => {
    wantRunningRef.current = false
    oscRef.current?.stop()
    lfoRef.current?.stop()
    oscRef.current = null
    lfoRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      void ctxRef.current.close()
    }
    ctxRef.current = null
    setAnalyser(null)
    setState('idle')
  }, [])

  const start = useCallback(async () => {
    const AC = getAudioContextCtor()
    if (!AC) {
      setState('unsupported')
      return
    }

    // Bypass local: usa o tom de teste em vez do microfone.
    if (FAKE_MIC) {
      setState('requesting')
      setError(null)
      wantRunningRef.current = true
      try {
        const ctx = new AC()
        ctxRef.current = ctx
        await ctx.resume().catch(() => {})
        buildFakeGraph(ctx)
        setState('running')
      } catch {
        setState('error')
        setError('Falha ao iniciar o sinal de teste.')
      }
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      return
    }
    setState('requesting')
    setError(null)
    wantRunningRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS)
      streamRef.current = stream

      const ctx = new AC()
      ctxRef.current = ctx
      await ctx.resume()
      buildGraph(stream, ctx)
      setState('running')
    } catch (e) {
      wantRunningRef.current = false
      const err = e as DOMException
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        setState('denied')
      } else if (err?.name === 'NotFoundError') {
        setState('error')
        setError('Nenhum microfone encontrado.')
      } else {
        setState('error')
        setError(err?.message ?? 'Erro ao acessar o microfone.')
      }
    }
  }, [buildGraph, buildFakeGraph])

  // Modo bypass: inicia o sinal de teste sozinho (sem gesto nem permissão).
  useEffect(() => {
    if (FAKE_MIC) void start()
  }, [start])

  // Retoma o áudio depois de um período em segundo plano: resume o contexto
  // (que o SO suspende) e readquire a faixa se ela morreu.
  const recover = useCallback(() => {
    if (!wantRunningRef.current || FAKE_MIC) return
    const ctx = ctxRef.current
    if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {})
    const track = streamRef.current?.getAudioTracks()[0]
    if (!track || track.readyState === 'ended') void reacquire()
  }, [reacquire])

  // Ao voltar do segundo plano. No Android costuma retomar sozinho aqui.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') recover()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [recover])

  // No iOS o AudioContext suspenso só pode ser retomado DENTRO de um gesto do
  // usuário (resume() fora de gesto é ignorado, e o visibilitychange não conta).
  // Então retomamos no primeiro toque após voltar — sem isso a captação fica
  // "rodando" mas muda, exigindo fechar e reabrir o app.
  useEffect(() => {
    const onGesture = () => recover()
    document.addEventListener('pointerdown', onGesture)
    return () => document.removeEventListener('pointerdown', onGesture)
  }, [recover])

  // Encerra ao desmontar.
  useEffect(() => () => stop(), [stop])

  return { state, error, analyser, sampleRate, start, stop }
}
