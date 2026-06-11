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

/** Mostrador semicircular: ponteiro aponta o desvio; fica verde quando afinado. */
export function TunerGauge({ cents, inTune, active }: TunerGaugeProps) {
  const c = cents == null ? 0 : Math.max(-50, Math.min(50, cents))
  const angle = (c / 50) * MAX_ANGLE

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
      className="w-full max-w-sm"
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
            className={cls}
            stroke="currentColor"
            strokeWidth={isZero ? 3 : isMajor ? 2 : 1.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* ponteiro */}
      <g transform={`rotate(${angle} ${PIVOT_X} ${PIVOT_Y})`} className={needleColor}>
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
      <circle cx={PIVOT_X} cy={PIVOT_Y} r="5" className={needleColor} fill="currentColor" />
    </svg>
  )
}
