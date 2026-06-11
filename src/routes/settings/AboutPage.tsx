import { PageHeader } from '../../components/ui/PageHeader'
import { ABOUT } from '../../content/about'

export function AboutPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <PageHeader title="Sobre" back />
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
        <p className="text-sm text-text-faint">Feito com 🎵 por {ABOUT.creator}.</p>
      </div>
    </div>
  )
}
