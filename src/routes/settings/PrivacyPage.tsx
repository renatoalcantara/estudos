import { PageHeader } from '../../components/ui/PageHeader'
import { PRIVACY } from '../../content/privacy'

export function PrivacyPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <PageHeader title="Privacidade" back sticky />
      <p className="px-1 font-mono text-xs text-text-faint">Atualizado em {PRIVACY.updatedAt}</p>
      <div className="flex flex-col gap-5 px-1">
        {PRIVACY.sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-semibold text-text">{s.title}</h2>
            <p className="mt-1 text-text-soft">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
