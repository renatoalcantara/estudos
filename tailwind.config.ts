import type { Config } from 'tailwindcss'

/**
 * Tokens derivados do DESIGN.md (template "sanity").
 * Cores semânticas (bg/surface/text/border) são dirigidas por CSS variables
 * em src/index.css para suportar tema claro/escuro. Acentos (brand/success/
 * error) são fixos pois independem do tema.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        'surface-2': 'var(--c-surface-2)',
        text: 'var(--c-text)',
        'text-soft': 'var(--c-text-soft)',
        'text-faint': 'var(--c-text-faint)',
        border: 'var(--c-border)',
        brand: { DEFAULT: '#f36458', deep: '#dd0000' },
        success: '#37cd84',
        error: '#dd0000',
        link: '#0052ef',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'app-xs': '3px',
        'app-sm': '4px',
        'app-md': '5px',
        'app-lg': '6px',
        marketing: '12px',
      },
      spacing: {
        section: '64px',
        'section-lg': '96px',
      },
      letterSpacing: {
        display: '-0.04em',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0,0,0,0.08)',
        'glow-success': '0 0 28px rgba(55,205,132,0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config
