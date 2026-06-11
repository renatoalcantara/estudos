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
    <div className="flex flex-col gap-6 px-4 pb-6">
      <PageHeader title="Ajustes" />

      <section>
        <SectionTitle>Aparência</SectionTitle>
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
        <SectionTitle>Sobre & contato</SectionTitle>
        <div className="overflow-hidden rounded-marketing border border-border">
          <ListRow to={PATHS.about} title="Sobre o app" subtitle="Quem criou e o que é" />
          <ListRow to={PATHS.donations} title="Doações" subtitle="Apoie o projeto via Pix" />
          <ListRow to={PATHS.contact} title="Fale conosco" subtitle="Envie sugestões e feedback" />
        </div>
      </section>

      <section>
        <SectionTitle>Legal</SectionTitle>
        <div className="overflow-hidden rounded-marketing border border-border">
          <ListRow to={PATHS.terms} title="Termos de uso" />
          <ListRow to={PATHS.privacy} title="Política de privacidade" />
        </div>
      </section>

      <p className="px-1 text-center text-xs text-text-faint">
        {ABOUT.appName} · versão {ABOUT.version}
      </p>
    </div>
  )
}
