import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { Button } from '../ui/Button'

/** Registra o service worker e oferece recarregar quando há nova versão. */
export function UpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    updateRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
      },
    })
  }, [])

  if (!needRefresh) return null

  return (
    <div className="safe-x fixed inset-x-0 bottom-20 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-marketing border border-border bg-surface px-4 py-3 shadow-soft">
      <span className="text-sm text-text">Nova versão disponível.</span>
      <Button variant="brand" className="h-9 px-4" onClick={() => void updateRef.current?.(true)}>
        Atualizar
      </Button>
    </div>
  )
}
