/**
 * Analytics (Google Analytics 4 + Microsoft Clarity).
 *
 * Carrega APENAS em produção (import.meta.env.PROD) e SOMENTE quando o ID
 * correspondente está definido via env (VITE_GA_MEASUREMENT_ID /
 * VITE_CLARITY_PROJECT_ID). Em dev nada é carregado.
 *
 * GA: enviamos page_view manualmente por rota, pois o app usa HashRouter
 * (a medição automática não captura mudanças de hash com confiabilidade).
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID
const ENABLED = import.meta.env.PROD

let started = false

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

function loadGA(id: string) {
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  // gtag empurra os próprios argumentos para o dataLayer.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  // send_page_view: false → controlamos os page_views por rota.
  window.gtag('config', id, { send_page_view: false })
}

function loadClarity(id: string) {
  window.clarity =
    window.clarity ||
    function clarity(...args: unknown[]) {
      ;(window.clarity!.q = window.clarity!.q || []).push(args)
    }
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.clarity.ms/tag/${id}`
  document.head.appendChild(s)
}

/** Inicializa os provedores uma única vez (no-op em dev ou sem IDs). */
export function initAnalytics() {
  if (started || !ENABLED) return
  started = true
  if (GA_ID) loadGA(GA_ID)
  if (CLARITY_ID) loadClarity(CLARITY_ID)
}

/**
 * Despacha um evento. Em produção envia ao GA (gtag); em dev apenas loga no
 * console (para validar a instrumentação sem poluir os dados reais).
 */
function send(name: string, params?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, params ?? {})
    return
  }
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

/** Envia um page_view para a rota atual. */
export function trackPageView(path: string, title?: string) {
  send('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
  })
}

/** Evento customizado. */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  send(name, params)
}

/** Define propriedades de usuário no GA (ex.: tema em uso). */
export function setUserProperties(props: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.debug('[analytics] user_properties', props)
    return
  }
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('set', 'user_properties', props)
}
