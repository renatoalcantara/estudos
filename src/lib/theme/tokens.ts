// Acentos fixos (independentes do tema) — do DESIGN.md (template "sanity").
// Úteis onde classes Tailwind não se aplicam bem (ex.: atributos de SVG).
export const ACCENT = {
  brand: '#6366f1',
  brandDeep: '#dd0000',
  success: '#37cd84',
  error: '#dd0000',
} as const

export type ThemeChoice = 'light' | 'dark' | 'system'
