import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { DONATIONS, pixQrValue } from '../../content/donations'
import { trackEvent } from '../../lib/analytics/analytics'

export function DonationsPage() {
  const [copied, setCopied] = useState(false)

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(DONATIONS.pixKey)
      setCopied(true)
      // Intenção de doar: copiar a chave Pix é o sinal mais forte de conversão.
      trackEvent('donation_copy_pix')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard pode falhar sem HTTPS/permissão — ignora silenciosamente
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-6">
      <PageHeader title="Doações" back />

      <p className="px-1 text-text-soft">{DONATIONS.intro}</p>

      <Card className="flex flex-col items-center gap-4">
        <div className="rounded-app-lg bg-white p-3">
          <QRCodeSVG value={pixQrValue()} size={184} level="M" />
        </div>

        <div className="w-full">
          <p className="text-center text-xs uppercase tracking-wide text-text-faint">
            {DONATIONS.pixKeyLabel}
          </p>
          <p className="mt-1 break-all text-center font-mono text-sm text-text">{DONATIONS.pixKey}</p>
        </div>

        <Button variant="brand" fullWidth onClick={copyKey}>
          {copied ? 'Chave copiada!' : 'Copiar chave Pix'}
        </Button>
      </Card>

      <p className="px-1 text-center text-xs text-text-faint">
        Aponte a câmera do seu banco para o QR Code ou use a chave acima.
      </p>
    </div>
  )
}
