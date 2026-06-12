import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** rótulo acessível do diálogo */
  label: string
  children: ReactNode
}

/**
 * Bottom sheet genérico: sobe de baixo (sheet-up), fecha animando para baixo
 * (sheet-down) e só então desmonta. Fecha no backdrop e no Esc. Cola na base
 * respeitando a safe-area inferior.
 */
export function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
    } else if (rendered) {
      setClosing(true)
      const t = setTimeout(() => setRendered(false), 260)
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
        aria-label={label}
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface px-5 pt-3 shadow-soft [padding-bottom:calc(env(safe-area-inset-bottom,0px)+1.25rem)] ${
          closing ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-text-faint/40" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body,
  )
}
