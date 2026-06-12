import type { ReactNode } from 'react'

/** Aplica os insets de área segura (notch/barra) nas bordas superior e laterais. */
export function SafeArea({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`safe-top safe-x ${className}`}>{children}</div>
}
