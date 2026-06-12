import { useState } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { trackEvent } from '../../lib/analytics/analytics'
import { BottomSheet } from '../ui/BottomSheet'

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 18.5h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12M12 3 8.5 6.5M12 3l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11H5.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18.5 11H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function Step({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text">
        {icon}
      </span>
      <span className="text-text-soft">{children}</span>
    </li>
  )
}

/**
 * Banner "Salve no seu celular" — só aparece em Android/iOS quando o app ainda
 * não está instalado. No Android dispara o prompt nativo; no iOS (sem API) abre
 * um sheet com as instruções de "Adicionar à Tela de Início".
 */
export function InstallCard() {
  const { platform, canShow, hasNativePrompt, promptInstall } = useInstallPrompt()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!canShow) return null

  const onClick = async () => {
    trackEvent('install_cta_click')
    if (platform === 'android' && hasNativePrompt) {
      await promptInstall()
      return
    }
    setSheetOpen(true)
  }

  return (
    <section>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-marketing border border-brand/30 bg-brand/[0.06] px-4 py-3.5 text-left transition duration-150 hover:bg-brand/10 active:scale-[0.99]"
      >
        <span className="text-brand">
          <PhoneIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-text">Salve no seu celular</span>
          <span className="block truncate text-sm text-text-faint">
            Acesse como se fosse um App
          </span>
        </span>
        <span className="text-brand">
          <DownloadIcon />
        </span>
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        label="Como instalar o app"
      >
        <h2 className="mb-1 text-lg font-semibold text-text">Salve no seu celular</h2>
        <p className="mb-5 text-sm text-text-faint">
          {platform === 'ios'
            ? 'No Safari, é só dois toques:'
            : 'No navegador, é só dois toques:'}
        </p>

        <ol className="flex flex-col gap-4">
          {platform === 'ios' ? (
            <>
              <Step icon={<ShareIcon />}>
                Toque em <span className="font-medium text-text">Compartilhar</span> na barra do
                Safari.
              </Step>
              <Step icon={<PlusIcon />}>
                Escolha{' '}
                <span className="font-medium text-text">Adicionar à Tela de Início</span> e confirme.
              </Step>
            </>
          ) : (
            <>
              <Step icon={<MenuIcon />}>
                Abra o <span className="font-medium text-text">menu</span> do navegador (⋮).
              </Step>
              <Step icon={<PlusIcon />}>
                Toque em{' '}
                <span className="font-medium text-text">Instalar app</span> ou{' '}
                <span className="font-medium text-text">Adicionar à tela inicial</span>.
              </Step>
            </>
          )}
        </ol>

        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          className="mt-7 w-full rounded-full bg-text py-3.5 text-sm font-semibold text-bg transition active:scale-[0.98]"
        >
          Entendi
        </button>
      </BottomSheet>
    </section>
  )
}
