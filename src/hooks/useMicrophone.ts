import { useCallback, useEffect, useRef, useState } from 'react'
import { FFT_SIZE } from '../lib/audio/audioConstants'

export type MicState = 'idle' | 'requesting' | 'running' | 'denied' | 'error' | 'unsupported'

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

  // Monta source + analyser num contexto e publica o analyser para os consumidores.
  const buildGraph = useCallback((stream: MediaStream, ctx: AudioContext) => {
    const source = ctx.createMediaStreamSource(stream)
    const node = ctx.createAnalyser()
    node.fftSize = FFT_SIZE
    node.smoothingTimeConstant = 0
    source.connect(node)

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

  const reacquire = useCallback(async () => {
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
    if (!navigator.mediaDevices?.getUserMedia || !AC) {
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
  }, [buildGraph])

  // Ao voltar do segundo plano: retoma o contexto e readquire se a faixa morreu.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible' || !wantRunningRef.current) return
      const ctx = ctxRef.current
      if (ctx && ctx.state === 'suspended') void ctx.resume()
      const track = streamRef.current?.getAudioTracks()[0]
      if (!track || track.readyState === 'ended') void reacquire()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [reacquire])

  // Encerra ao desmontar.
  useEffect(() => () => stop(), [stop])

  return { state, error, analyser, sampleRate, start, stop }
}
