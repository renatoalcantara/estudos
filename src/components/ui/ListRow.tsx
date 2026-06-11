import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ListRowProps {
  to?: string
  href?: string
  icon?: ReactNode
  title: string
  subtitle?: string
  trailing?: ReactNode
}

function Chevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Body({ icon, title, subtitle, trailing }: Omit<ListRowProps, 'to' | 'href'>) {
  return (
    <>
      {icon && <span className="text-text-soft">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block truncate text-text">{title}</span>
        {subtitle && <span className="block truncate text-sm text-text-faint">{subtitle}</span>}
      </span>
      <span className="text-text-faint">{trailing ?? <Chevron />}</span>
    </>
  )
}

/** Linha de lista para a tela de Preferências. Vira <Link>, <a> ou <div>. */
export function ListRow({ to, href, ...rest }: ListRowProps) {
  const cls =
    'flex items-center gap-3 px-4 py-3.5 bg-surface border-b border-border last:border-b-0 transition-colors hover:bg-surface-2'

  if (to) {
    return (
      <Link to={to} className={cls}>
        <Body {...rest} />
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        <Body {...rest} />
      </a>
    )
  }
  return (
    <div className={cls}>
      <Body {...rest} />
    </div>
  )
}
