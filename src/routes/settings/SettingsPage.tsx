import { InstallCard } from '../../components/settings/InstallCard'
import { Card } from '../../components/ui/Card'
import { ListRow } from '../../components/ui/ListRow'
import { PageHeader } from '../../components/ui/PageHeader'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { ABOUT } from '../../content/about'
import { useTheme } from '../../hooks/useTheme'
import type { ThemeChoice } from '../../lib/theme/tokens'
import { PATHS } from '../paths'

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="px-1 pb-2 font-mono text-[11px] uppercase tracking-wide text-text-faint">
      {children}
    </h2>
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-6 px-4 pb-[var(--nav-h)]">
      <PageHeader title="Ajustes" sticky />

      <InstallCard />

      <section>
        <SectionTitle>Visual</SectionTitle>
        <Card className="flex flex-col gap-3 p-4">
          <span className="text-text">Tema</span>
          <SegmentedControl<ThemeChoice>
            ariaLabel="Tema"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'system', label: 'Sistema' },
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
            ]}
          />
        </Card>
      </section>

      <section>
        <SectionTitle>Sobre & recados</SectionTitle>
        <div className="overflow-hidden rounded-marketing border border-border">
          <ListRow to={PATHS.about} title="Sobre" subtitle="A história por trás" />
          <ListRow to={PATHS.donations} title="Doações" subtitle="Me paga um cafezinho? (Pix) ☕" />
          <ListRow to={PATHS.contact} title="Fala comigo" subtitle="Manda ideia, bug ou só um oi" />
        </div>
      </section>

      <section>
        <SectionTitle>Letrinhas miúdas</SectionTitle>
        <div className="overflow-hidden rounded-marketing border border-border">
          <ListRow to={PATHS.terms} title="Termos de uso" subtitle="As regras do jogo" />
          <ListRow to={PATHS.privacy} title="Privacidade" subtitle="O que rola com seus dados" />
        </div>
      </section>

      <p className="px-1 text-center text-xs text-text-faint">
        {ABOUT.appName} · v{ABOUT.version} · feito com carinho 🎸
      </p>
    </div>
  )
}
