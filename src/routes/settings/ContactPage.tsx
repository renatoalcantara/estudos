import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { CONTACT_EMAIL } from '../paths'

export function ContactPage() {
  const subject = encodeURIComponent('Oi, vim pelo Afinador')
  return (
    <div className="flex flex-col gap-5 px-4 pb-6">
      <PageHeader title="Fala comigo" back sticky />

      <p className="px-1 text-text-soft">
        Achou um bug, tem uma sugestão, ou só quer dar um oi? Manda que eu leio tudo (e respondo).
      </p>

      <Card className="flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-faint">E-mail</p>
          <p className="mt-1 break-all font-mono text-sm text-text">{CONTACT_EMAIL}</p>
        </div>
        <Button
          variant="brand"
          onClick={() => {
            window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}`
          }}
        >
          Mandar e-mail
        </Button>
      </Card>
    </div>
  )
}
