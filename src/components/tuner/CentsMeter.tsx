import type { TunerReading } from '../../hooks/useTuner'

interface CentsMeterProps {
  reading: TunerReading | null
  silent: boolean
}

/** Valor numérico do desvio + instrução de ação (apertar/afrouxar). */
export function CentsMeter({ reading, silent }: CentsMeterProps) {
  if (!reading) {
    return <div className="h-12" aria-hidden="true" />
  }

  const cents = Math.round(reading.cents)
  const inTune = reading.inTune

  let status: string
  let statusColor: string
  if (inTune) {
    status = 'Afinado'
    statusColor = 'text-success'
  } else if (cents < 0) {
    status = 'Muito grave · aperte a corda'
    statusColor = 'text-brand'
  } else {
    status = 'Muito agudo · afrouxe a corda'
    statusColor = 'text-brand'
  }

  const sign = cents > 0 ? '+' : ''
  const dimmed = silent ? 'opacity-40' : ''

  return (
    <div className={`flex flex-col items-center gap-1 transition-opacity ${dimmed}`}>
      <span className={`font-mono text-sm ${inTune ? 'text-success' : 'text-text-soft'}`}>
        {sign}
        {cents} ¢
      </span>
      <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
    </div>
  )
}
