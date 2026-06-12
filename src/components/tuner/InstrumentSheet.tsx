import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Instrument, InstrumentId } from '../../lib/instruments/types'
import { InstrumentSelector } from './InstrumentSelector'
import { TuningSelector } from './TuningSelector'

interface InstrumentSheetProps {
  open: boolean
  onClose: () => void
  instrument: Instrument
  instrumentId: InstrumentId
  onInstrument: (id: InstrumentId) => void
  tuningId: string
  onTuning: (id: string) => void
}

/**
 * Bottom sheet para trocar instrumento e afinação — tira esses controles da tela
 * principal (que fica só com dial + cordas, por proximidade). Sobe de baixo,
 * fecha no backdrop, no Esc ou na alça.
 */
export function InstrumentSheet({
  open,
  onClose,
  instrument,
  instrumentId,
  onInstrument,
  tuningId,
  onTuning,
}: InstrumentSheetProps) {
  // Mantém o sheet montado durante a animação de saída: `rendered` controla a
  // presença no DOM; `closing` troca a animação de subida pela de descida.
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
    } else if (rendered) {
      setClosing(true)
      const t = setTimeout(() => setRendered(false), 260) // = duração de sheet-down
      return () => clearTimeout(t)
    }
  }, [open, rendered])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!rendered) return null

  const hasTunings = instrument.tunings.length > 1

  // Portal para o body: evita que o transform residual do animate-page-enter
  // (containing block) prenda o position:fixed do sheet à área de conteúdo.
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          closing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Instrumento e afinação"
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface px-5 pt-3 shadow-soft [padding-bottom:calc(env(safe-area-inset-bottom,0px)+0.5rem)] ${
          closing ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-text-faint/40" aria-hidden="true" />

        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wide text-text-faint">
          Instrumento
        </h2>
        <InstrumentSelector value={instrumentId} onChange={onInstrument} />

        {hasTunings && (
          <>
            <h2 className="mb-3 mt-6 font-mono text-[11px] uppercase tracking-wide text-text-faint">
              Afinação
            </h2>
            <TuningSelector tunings={instrument.tunings} value={tuningId} onChange={onTuning} />
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-text py-3.5 text-sm font-semibold text-bg transition active:scale-[0.98]"
        >
          Pronto
        </button>
      </div>
    </div>,
    document.body,
  )
}
