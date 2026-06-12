import { useEffect, useMemo, useState } from 'react'

export type InstallPlatform = 'android' | 'ios' | 'other'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  // iPadOS 13+ se identifica como "Macintosh"; distingue pelo touch.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  return 'other'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/**
 * Lógica de "Adicionar à tela de início" (A2HS).
 * - Android: captura o evento `beforeinstallprompt` e oferece o prompt nativo.
 * - iOS: não há API — quem chama deve exibir instruções manuais.
 * - `canShow` só é true em Android/iOS e quando o app NÃO está instalado.
 */
export function useInstallPrompt() {
  const platform = useMemo(detectPlatform, [])
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [standalone] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const canShow = (platform === 'android' || platform === 'ios') && !standalone && !installed

  /** Dispara o prompt nativo (Android). Retorna true se o usuário aceitou. */
  const promptInstall = async (): Promise<boolean> => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome === 'accepted'
  }

  return { platform, canShow, hasNativePrompt: deferred != null, promptInstall }
}
