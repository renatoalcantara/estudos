import { useEffect, useRef } from 'react'

interface TunerGaugeProps {
  /** desvio em cents (null quando não há leitura) */
  cents: number | null
  inTune: boolean
  /** há sinal sendo lido agora */
  active: boolean
}

const PIVOT_X = 100
const PIVOT_Y = 100
const RADIUS = 84
const MAX_ANGLE = 70 // graus em ±50 cents

const TICKS = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]

function polar(centValue: number, r: number) {
  const rad = ((centValue / 50) * MAX_ANGLE * Math.PI) / 180
  return {
    x: PIVOT_X + r * Math.sin(rad),
    y: PIVOT_Y - r * Math.cos(rad),
  }
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Mostrador semicircular. O ponteiro é animado de forma IMPERATIVA com
 * requestAnimationFrame (suavização exponencial independente do FPS), escrevendo
 * direto no atributo `transform` via ref — sem re-render do React. Isso garante
 * 60fps mesmo com a detecção atualizando a ~30Hz.
 */
export function TunerGauge({ cents, inTune, active }: TunerGaugeProps) {
  const c = cents == null ? 0 : Math.max(-50, Math.min(50, cents))
  const targetAngle = (c / 50) * MAX_ANGLE

  const needleRef = useRef<SVGGElement>(null)
  const targetRef = useRef(0)
  const displayedRef = useRef(0)

  // Mantém o alvo atualizado (atribuição de ref durante o render é segura).
  targetRef.current = targetAngle

  useEffect(() => {
    let raf = 0
    let lastT = performance.now()
    const reduce = prefersReducedMotion()
    const tau = 40 // constante de tempo (ms): menor = mais rápido/responsivo

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(64, t - lastT)
      lastT = t

      const target = targetRef.current
      if (reduce) {
        displayedRef.current = target
      } else {
        const k = 1 - Math.exp(-dt / tau)
        displayedRef.current += (target - displayedRef.current) * k
      }

      const g = needleRef.current
      if (g) {
        g.setAttribute(
          'transform',
          `rotate(${displayedRef.current.toFixed(2)} ${PIVOT_X} ${PIVOT_Y})`,
        )
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const needleColor = !active
    ? 'text-text-faint'
    : inTune
      ? 'text-success'
      : Math.abs(c) < 15
        ? 'text-brand'
        : 'text-text-soft'

  return (
    <svg
      viewBox="0 0 200 116"
      className="w-full max-w-xs"
      role="img"
      aria-label={
        cents == null ? 'Medidor de afinação sem sinal' : `Desvio de ${Math.round(c)} cents`
      }
    >
      {/* trilho */}
      <path
        d={`M${polar(-50, RADIUS).x} ${polar(-50, RADIUS).y} A${RADIUS} ${RADIUS} 0 0 1 ${polar(50, RADIUS).x} ${polar(50, RADIUS).y}`}
        fill="none"
        className="text-border"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* marcações */}
      {TICKS.map((t) => {
        const isZero = t === 0
        const isMajor = t % 50 === 0
        const outer = polar(t, RADIUS)
        const inner = polar(t, isZero ? 66 : isMajor ? 70 : 74)
        const cls = isZero
          ? inTune && active
            ? 'text-success'
            : 'text-brand'
          : 'text-text-faint'
        return (
          <line
            key={t}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            className={`transition-colors duration-300 ${cls}`}
            stroke="currentColor"
            strokeWidth={isZero ? 3 : isMajor ? 2 : 1.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* halo de "afinado" (aparece suavemente quando in-tune) */}
      <circle
        cx={PIVOT_X}
        cy={PIVOT_Y}
        r="13"
        fill="currentColor"
        className={`text-success transition-opacity duration-500 ${
          inTune && active ? 'opacity-25' : 'opacity-0'
        }`}
      />

      {/* ponteiro (transform controlado pelo rAF) */}
      <g ref={needleRef} className={`transition-colors duration-200 ${needleColor}`}>
        <line
          x1={PIVOT_X}
          y1={PIVOT_Y}
          x2={PIVOT_X}
          y2={PIVOT_Y - RADIUS + 6}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <circle
        cx={PIVOT_X}
        cy={PIVOT_Y}
        r="5"
        className={`transition-colors duration-200 ${needleColor}`}
        fill="currentColor"
      />
    </svg>
  )
}
