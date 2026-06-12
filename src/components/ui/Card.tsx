import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

/** Cartão de superfície (feature-card do DESIGN.md): raio marketing, borda hairline. */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-marketing border border-border bg-surface p-6 ${className}`}>
      {children}
    </div>
  )
}
