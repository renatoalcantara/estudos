/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** GA4 Measurement ID, ex.: G-XXXXXXXXXX (opcional; só usado em produção) */
  readonly VITE_GA_MEASUREMENT_ID?: string
  /** Microsoft Clarity Project ID (opcional; só usado em produção) */
  readonly VITE_CLARITY_PROJECT_ID?: string
  /** Desativa o microfone falso em dev quando '0' */
  readonly VITE_FAKE_MIC?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
