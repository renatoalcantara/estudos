import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'brand' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-link'

const variants: Record<Variant, string> = {
  // pílula de marketing (DESIGN.md): preenchimento sólido, raio full
  primary: 'rounded-full h-12 px-6 bg-text text-bg hover:opacity-90',
  brand: 'rounded-full h-12 px-6 bg-brand text-ink hover:bg-brand/90',
  secondary:
    'rounded-app-md h-11 px-4 bg-surface-2 text-text border border-border hover:bg-border',
  ghost: 'rounded-full h-11 px-4 text-text-soft hover:text-text',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
