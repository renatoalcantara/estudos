import { PageHeader } from '../../components/ui/PageHeader'
import { ABOUT } from '../../content/about'
import { trackEvent } from '../../lib/analytics/analytics'

export function AboutPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-[var(--nav-h)]">
      <PageHeader title="Sobre" back sticky />
      <div className="flex flex-col gap-4 px-1">
        <div>
          <h2 className="text-xl font-semibold text-text">{ABOUT.appName}</h2>
          <p className="font-mono text-xs text-text-faint">versão {ABOUT.version}</p>
        </div>
        {ABOUT.paragraphs.map((p, i) => (
          <p key={i} className="text-text-soft">
            {p}
          </p>
        ))}
        <p className="text-sm text-text-faint">
          Feito com 🎵 pelo {ABOUT.creator}. Conheça meu trabalho em{' '}
          <a
            href={ABOUT.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('about_site_click')}
            className="font-medium text-brand underline underline-offset-2 transition hover:opacity-80"
          >
            {ABOUT.siteLabel}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
