import { useEffect, useRef } from 'react'
import type { TunerReading } from '../../hooks/useTuner'

const CENTER = 100
const ANGLE_SPAN = 100 // graus de deflexão para ±50 cents (arco superior ~200°)
const R_OUTER = 87
const R_PUCK = 87
const TICKS = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]

function clamp(c: number) {
  return Math.max(-50, Math.min(50, c))
}
function angleFor(c: number) {
  return (clamp(c) / 50) * ANGLE_SPAN
}
function tickPoint(c: number, r: number) {
  const rad = (angleFor(c) * Math.PI) / 180
  return { x: CENTER + r * Math.sin(rad), y: CENTER - r * Math.cos(rad) }
}
function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface TunerDialProps {
  reading: TunerReading | null
  silent: boolean
}

/**
 * Mostrador físico: face elevada com escala gravada no arco superior e um "puck"
 * luminoso que corre o arco na posição do desvio (em cents). O puck é animado de
 * forma imperativa via requestAnimationFrame (suavização exponencial, 60fps),
 * sem re-render do React. A leitura (nota, solfejo, Hz, ação) fica no centro.
 * Afinado: anel e puck acendem em índigo, com uma "trava" suave.
 */
export function TunerDial({ reading, silent }: TunerDialProps) {
  const active = reading != null && !silent
  const cents = reading ? clamp(reading.cents) : 0
  const inTune = (reading?.inTune ?? false) && active

  const puckRef = useRef<SVGGElement>(null)
  const targetRef = useRef(0)
  const displayedRef = useRef(0)
  targetRef.current = angleFor(cents)

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const reduce = prefersReducedMotion()
    const tau = 45 // constante de tempo (ms): menor = mais responsivo

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(64, t - last)
      last = t
      const target = targetRef.current
      if (reduce) displayedRef.current = target
      else displayedRef.current += (target - displayedRef.current) * (1 - Math.exp(-dt / tau))
      puckRef.current?.setAttribute(
        'transform',
        `rotate(${displayedRef.current.toFixed(2)} ${CENTER} ${CENTER})`,
      )
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const puckColor = !active
    ? 'var(--c-text-faint)'
    : inTune
      ? 'var(--c-brand)'
      : 'var(--c-text)'

  const sign = reading ? (reading.cents > 0 ? '+' : '') : ''
  const centsRounded = reading ? Math.round(reading.cents) : 0
  const action = inTune
    ? 'Afinado'
    : centsRounded < 0
      ? 'aperte a corda'
      : 'afrouxe a corda'

  return (
    <div className="dial-well aspect-square w-full max-w-[clamp(220px,72vw,300px)] p-3">
      <div
        className="dial-face relative h-full w-full transition-shadow duration-500"
        style={
          inTune
            ? { boxShadow: 'var(--sh-raised), 0 0 0 10px var(--c-brand), 0 0 34px -2px var(--c-brand)' }
            : undefined
        }
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* escala gravada (arco superior) */}
          {TICKS.map((c) => {
            const isZero = c === 0
            const isMajor = c % 50 === 0
            const o = tickPoint(c, R_OUTER)
            const i = tickPoint(c, isZero ? 74 : isMajor ? 77 : 79)
            const col = isZero
              ? inTune
                ? 'var(--c-brand)'
                : 'var(--c-text-soft)'
              : 'var(--c-text-faint)'
            return (
              <line
                key={c}
                x1={o.x}
                y1={o.y}
                x2={i.x}
                y2={i.y}
                stroke={col}
                strokeWidth={isZero ? 2.6 : isMajor ? 2 : 1.2}
                strokeLinecap="round"
                opacity={isZero ? 1 : 0.65}
                className="transition-colors duration-300"
              />
            )
          })}

          {/* puck luminoso (transform controlado pelo rAF) */}
          <g ref={puckRef} style={{ filter: inTune ? 'drop-shadow(0 0 7px var(--c-brand))' : 'none' }}>
            <circle
              cx={CENTER}
              cy={CENTER - R_PUCK}
              r="5.5"
              fill={puckColor}
              className="transition-[fill] duration-200"
            />
          </g>
        </svg>

        {/* leitura central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-7 text-center">
          {reading ? (
            <>
              <div
                key={`${reading.note.noteName}${reading.note.octave}`}
                className={`flex animate-note-pop items-start leading-none transition-colors duration-300 ${
                  inTune ? 'text-brand' : 'text-text'
                } ${silent ? 'opacity-40' : ''} ${inTune ? 'animate-in-tune-pulse' : ''}`}
              >
                <span className="text-[3.5rem] font-semibold tracking-display">
                  {reading.note.noteName}
                </span>
                <span className="ml-1 mt-2 text-xl font-medium opacity-60">
                  {reading.note.octave}
                </span>
              </div>

              <div className={`mt-0.5 flex items-baseline gap-2 ${silent ? 'opacity-40' : ''}`}>
                <span className="text-sm text-text-soft">{reading.note.solfege}</span>
                <span className="font-mono text-xs tabular-nums text-text-faint">
                  {reading.frequency.toFixed(1)} Hz
                </span>
              </div>

              <div
                className={`mt-3 flex flex-col items-center gap-0.5 transition-opacity duration-300 ${
                  silent ? 'opacity-40' : ''
                }`}
              >
                <span
                  className={`font-mono text-sm tabular-nums transition-colors duration-300 ${
                    inTune ? 'text-brand' : 'text-text-soft'
                  }`}
                >
                  {sign}
                  {centsRounded} ¢
                </span>
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    inTune ? 'text-brand' : 'text-text-faint'
                  }`}
                >
                  {action}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl font-semibold tracking-display text-text-faint">—</div>
              <p className="mt-2 text-sm text-text-faint">Toque uma corda</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
