import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { DONATIONS, pixQrValue } from '../../content/donations'
import { trackEvent } from '../../lib/analytics/analytics'

/** Copia texto com fallback para contextos sem Clipboard API (Safari/PWA). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

export function DonationsPage() {
  const [copied, setCopied] = useState(false)

  const copyKey = async () => {
    if (!(await copyText(DONATIONS.pixKey))) return
    setCopied(true)
    // Intenção de doar: copiar a chave Pix é o sinal mais forte de conversão.
    trackEvent('donation_copy_pix')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-[var(--nav-h)]">
      <PageHeader title="Doações" back sticky />

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
          {copied ? 'Copiei! valeu 💜' : 'Copiar a chave Pix'}
        </Button>
      </Card>

      <p className="px-1 text-center text-xs text-text-faint">
        Aponta a câmera do banco no QR, ou usa a chave aí de cima.
      </p>
    </div>
  )
}
