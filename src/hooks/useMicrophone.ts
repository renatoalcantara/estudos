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

/**
 * Gerencia o ciclo de vida do microfone: getUserMedia + AudioContext + AnalyserNode.
 * `start()` DEVE ser chamado dentro de um gesto do usuário (exigência do iOS Safari).
 */
export function useMicrophone(): MicHandle {
  const [state, setState] = useState<MicState>('idle')
  const [error, setError] = useState<string | null>(null)
  // analyser/sampleRate em estado para disparar re-render quando ficarem prontos
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [sampleRate, setSampleRate] = useState(44100)

  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stop = useCallback(() => {
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      })
      streamRef.current = stream

      const ctx = new AC()
      await ctx.resume()
      const source = ctx.createMediaStreamSource(stream)
      const node = ctx.createAnalyser()
      node.fftSize = FFT_SIZE
      node.smoothingTimeConstant = 0
      source.connect(node)

      ctxRef.current = ctx
      setAnalyser(node)
      setSampleRate(ctx.sampleRate)
      setState('running')
    } catch (e) {
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
  }, [])

  // O iOS suspende o AudioContext ao ir para segundo plano — retomar ao voltar.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && ctxRef.current?.state === 'suspended') {
        void ctxRef.current.resume()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Encerra ao desmontar.
  useEffect(() => () => stop(), [stop])

  return { state, error, analyser, sampleRate, start, stop }
}
