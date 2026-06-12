import { useEffect, useState } from 'react'

interface Metrics {
  saib: number
  innerH: number
  visualH: number
  screenH: number
  standalone: boolean
  dpr: number
}

const KEY = 'afinador:nav-debug-offset'

/**
 * Painel de debug TEMPORÁRIO para calibrar a posição da navbar na PWA.
 * O slider controla `--nav-debug-offset` (px somados ao padding inferior da nav);
 * mostra também métricas do ambiente (safe-area, viewport, standalone) para
 * diagnóstico. Remover quando o valor certo for encontrado.
 */
export function NavDebugger() {
  const [offset, setOffset] = useState<number>(() => {
    const v = Number(localStorage.getItem(KEY))
    return Number.isFinite(v) ? v : 0
  })
  const [m, setM] = useState<Metrics | null>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    document.documentElement.style.setProperty('--nav-debug-offset', `${offset}px`)
    localStorage.setItem(KEY, String(offset))
  }, [offset])

  useEffect(() => {
    const read = () => {
      const probe = document.createElement('div')
      probe.style.cssText =
        'position:fixed;left:0;bottom:0;width:0;height:env(safe-area-inset-bottom,0px);pointer-events:none;'
      document.body.appendChild(probe)
      const saib = Math.round(probe.getBoundingClientRect().height)
      document.body.removeChild(probe)
      setM({
        saib,
        innerH: Math.round(window.innerHeight),
        visualH: Math.round(window.visualViewport?.height ?? 0),
        screenH: Math.round(window.screen.height),
        standalone:
          window.matchMedia('(display-mode: standalone)').matches ||
          (navigator as unknown as { standalone?: boolean }).standalone === true,
        dpr: window.devicePixelRatio,
      })
    }
    read()
    window.addEventListener('resize', read)
    window.visualViewport?.addEventListener('resize', read)
    return () => {
      window.removeEventListener('resize', read)
      window.visualViewport?.removeEventListener('resize', read)
    }
  }, [])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-2 top-2 z-[100] rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white"
      >
        debug nav
      </button>
    )
  }

  return (
    <div className="fixed inset-x-2 top-2 z-[100] rounded-xl bg-black/85 p-3 font-mono text-[11px] leading-tight text-white shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold">nav offset: {offset}px</span>
        <button onClick={() => setOpen(false)} className="rounded bg-white/15 px-2 py-0.5">
          ocultar
        </button>
      </div>

      <input
        type="range"
        min={-60}
        max={80}
        step={1}
        value={offset}
        onChange={(e) => setOffset(Number(e.target.value))}
        className="mt-2 w-full"
      />

      <div className="mt-1 flex items-center justify-between gap-2">
        <button onClick={() => setOffset((o) => o - 1)} className="rounded bg-white/15 px-3 py-1">
          −1
        </button>
        <button onClick={() => setOffset(0)} className="rounded bg-white/15 px-3 py-1">
          zerar
        </button>
        <button onClick={() => setOffset((o) => o + 1)} className="rounded bg-white/15 px-3 py-1">
          +1
        </button>
      </div>

      {m && (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-white/80">
          <span>safe-bottom: {m.saib}px</span>
          <span>innerH: {m.innerH}</span>
          <span>visualH: {m.visualH}</span>
          <span>screenH: {m.screenH}</span>
          <span>standalone: {String(m.standalone)}</span>
          <span>dpr: {m.dpr}</span>
        </div>
      )}
    </div>
  )
}
